import { getFormValues, isValid, getFormInitialValues } from "redux-form";
import { AppState } from "reducers";
import { Action } from "entities/Action";
import { ActionData } from "reducers/entityReducers/actionsReducer";

type GetFormData = (
  state: AppState,
  formName: string,
) => { initialValues: any; values: any; valid: boolean };

export const getFormData: GetFormData = (state, formName) => {
  const initialValues = getFormInitialValues(formName)(state) as Action;
  const values = getFormValues(formName)(state) as Action;
  const valid = isValid(formName)(state);
  return { initialValues, values, valid };
};

export const getApiName = (state: AppState, id: string) => {
  return state.entities.actions.find(
    (action: ActionData) => action.config.id === id,
  )?.config.name;
};
