import { get } from "lodash";
import {
  ReduxActionTypes,
  ReduxActionErrorTypes,
  ReduxAction,
} from "constants/ReduxActionConstants";
import log from "loglevel";
import history from "utils/history";
import { ApiResponse } from "api/ApiResponses";
import { Variant } from "components/ads/common";
import { Toaster } from "components/ads/Toast";
import { flushErrors } from "actions/errorActions";
import { AUTH_LOGIN_URL } from "constants/routes";
import { ERROR_CODES } from "constants/ApiConstants";
import { getSafeCrash } from "selectors/errorSelectors";
import { getCurrentUser } from "selectors/usersSelectors";
import { put, takeLatest, call, select } from "redux-saga/effects";
import { ERROR_401, ERROR_500, ERROR_0 } from "constants/messages";
import { DEFAULT_ERROR_MESSAGE, DEFAULT_ACTION_ERROR } from "constants/errors";

export function* callAPI(apiCall: any, requestPayload: any) {
  try {
    return yield call(apiCall, requestPayload);
  } catch (error) {
    return yield error;
  }
}
const getErrorMessage = (code: number) => {
  switch (code) {
    case 401:
      return ERROR_401;
    case 500:
      return ERROR_500;
    case 0:
      return ERROR_0;
  }
};

export function* validateResponse(response: ApiResponse | any, show = true) {
  if (!response) {
    throw Error("");
  }
  if (!response.responseMeta && !response.status) {
    throw Error(getErrorMessage(0));
  }
  if (!response.responseMeta && response.status) {
    throw Error(getErrorMessage(response.status));
  }
  if (response.responseMeta.success) {
    return true;
  } else {
    yield put({
      type: ReduxActionErrorTypes.API_ERROR,
      payload: {
        error: response.responseMeta.error,
        show,
      },
    });
    throw Error(response.responseMeta.error.message);
  }
}

export function getResponseErrorMessage(response: ApiResponse) {
  return response.responseMeta.error
    ? response.responseMeta.error.message
    : undefined;
}

type ErrorPayloadType = {
  code?: number | string;
  message?: string;
  crash?: boolean;
};
let ActionErrorDisplayMap: {
  [key: string]: (error: ErrorPayloadType) => string;
} = {};

Object.keys(ReduxActionErrorTypes).forEach((type: string) => {
  ActionErrorDisplayMap[type] = () =>
    DEFAULT_ERROR_MESSAGE + " action: " + type;
});

ActionErrorDisplayMap = {
  ...ActionErrorDisplayMap,
  [ReduxActionErrorTypes.API_ERROR]: (error) =>
    get(error, "message", DEFAULT_ERROR_MESSAGE),
  [ReduxActionErrorTypes.FETCH_PAGE_ERROR]: () =>
    DEFAULT_ACTION_ERROR("fetching the page"),
  [ReduxActionErrorTypes.SAVE_PAGE_ERROR]: () =>
    DEFAULT_ACTION_ERROR("saving the page"),
};

enum ErrorEffectTypes {
  SHOW_ALERT = "SHOW_ALERT",
  SAFE_CRASH = "SAFE_CRASH",
  LOG_ERROR = "LOG_ERROR",
}

export function* errorSaga(
  errorAction: ReduxAction<{
    error: ErrorPayloadType;
    show?: boolean;
    crash?: boolean;
  }>,
) {
  const effects = [ErrorEffectTypes.LOG_ERROR];
  const { type, payload } = errorAction;
  const { show = true, error } = payload || {};
  const message = get(error, "message", ActionErrorDisplayMap[type](error));

  if (show) {
    effects.push(ErrorEffectTypes.SHOW_ALERT);
  }
  if (error && error.crash) {
    effects.push(ErrorEffectTypes.SAFE_CRASH);
  }

  for (const effect of effects) {
    switch (effect) {
      case ErrorEffectTypes.LOG_ERROR: {
        logErrorSaga(errorAction);
        break;
      }
      case ErrorEffectTypes.SHOW_ALERT: {
        showAlertAboutError(message);
        break;
      }
      case ErrorEffectTypes.SAFE_CRASH: {
        yield call(crashAppSaga);
        break;
      }
    }
  }

  yield put({
    type: ReduxActionTypes.REPORT_ERROR,
    payload: {
      source: errorAction.type,
      message,
    },
  });
}

function logErrorSaga(action: ReduxAction<{ error: ErrorPayloadType }>) {
  log.debug(`Error in action ${action.type}`);
  if (action.payload) log.error(action.payload.error);
}

function showAlertAboutError(message: string) {
  Toaster.show({ text: message, variant: Variant.danger });
}

function* crashAppSaga() {
  yield put({
    type: ReduxActionTypes.SAFE_CRASH_APPSMITH,
  });
}

/**
 * this saga do some logic before actually setting safeCrash to true
 */
function* safeCrashSagaRequest(action: ReduxAction<{ code?: string }>) {
  const user = yield select(getCurrentUser);
  const code = get(action, "payload.code");

  // if user is not logged and the error is "PAGE_NOT_FOUND",
  // redirecting user to login page with redirecTo param
  if (
    get(user, "email") === "anonymousUser" &&
    code === ERROR_CODES.PAGE_NOT_FOUND
  ) {
    window.location.href = `${AUTH_LOGIN_URL}?redirectUrl=${window.location.href}`;

    return false;
  }

  // if there is no action to be done, just calling the safe crash action
  yield put({
    type: ReduxActionTypes.SAFE_CRASH_APPSMITH,
    payload: {
      code,
    },
  });
}

/**
 * flush errors and redirect users to a url
 *
 * @param action
 */
export function* flushErrorsAndRedirectSaga(
  action: ReduxAction<{ url?: string }>,
) {
  const safeCrash = yield select(getSafeCrash);

  if (safeCrash) {
    yield put(flushErrors());
  }

  history.push(action.payload.url);
}

export default function* errorSagas() {
  yield takeLatest(Object.values(ReduxActionErrorTypes), errorSaga);
  yield takeLatest(
    ReduxActionTypes.FLUSH_AND_REDIRECT,
    flushErrorsAndRedirectSaga,
  );
  yield takeLatest(
    ReduxActionTypes.SAFE_CRASH_APPSMITH_REQUEST,
    safeCrashSagaRequest,
  );
}
