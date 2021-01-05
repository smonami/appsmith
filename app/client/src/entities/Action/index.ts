import { Datasource, EmbeddedRestDatasource } from "entities/Datasource";
import { DynamicPath } from "../../utils/DynamicBindingUtils";

export enum PluginType {
  API = "API",
  DB = "DB",
}

export enum PaginationType {
  NONE = "NONE",
  PAGE_NO = "PAGE_NO",
  URL = "URL",
}

export interface ActionConfig {
  timeoutInMillisecond: number;
  paginationType?: PaginationType;
}

export interface ActionProvider {
  name: string;
  imageUrl: string;
  url: string;
  description: string;
  credentialSteps: string;
}

export interface Property {
  key: string;
  value: string;
}

export interface BodyFormData {
  editable: boolean;
  mandatory: boolean;
  description: string;
  key: string;
  value?: string;
  type: string;
}

export interface ApiActionConfig extends ActionConfig {
  headers: Property[];
  httpMethod: string;
  path?: string;
  body?: JSON | string | Record<string, any> | null;
  queryParameters?: Property[];
  bodyFormData?: BodyFormData[];
}

export interface QueryActionConfig extends ActionConfig {
  body: string;
}

interface ActionDatasource {
  id: string;
}

interface BaseAction {
  id: string;
  name: string;
  //datasource: EmbeddedRestDatasource | ActionDatasource;
  organizationId: string;
  pageId: string;
  collectionId?: string;
  //actionConfiguration: Partial<ActionConfig>;
  pluginId: string;
  //pluginType: PluginType;
  executeOnLoad: boolean;
  dynamicBindingPathList: DynamicPath[];
  isValid: boolean;
  invalids: string[];
  jsonPathKeys: string[];
  cacheResponse: string;
  confirmBeforeExecute?: boolean;
  eventData?: any;
}

interface BaseApiAction extends BaseAction {
  pluginType: PluginType.API;
  actionConfiguration: ApiActionConfig;
}

export interface EmbeddedApiAction extends BaseApiAction {
  datasource: EmbeddedRestDatasource;
}

export interface DatasourceApiAction extends BaseApiAction {
  datasource: ActionDatasource;
}

export type ApiAction = EmbeddedApiAction | DatasourceApiAction;

export type RapidApiAction = ApiAction & {
  templateId: string;
  proverId: string;
  provider: ActionProvider;
  pluginId: string;
  documentation: { text: string };
};

export interface QueryAction extends BaseAction {
  pluginType: PluginType.DB;
  actionConfiguration: QueryActionConfig;
}

export type Action = ApiAction | QueryAction;

export interface ActionWithDatasource {
  action: Action;
  datasource: EmbeddedRestDatasource | Datasource;
}
