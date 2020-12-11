import { Property } from "entities/Action";
import { EmbeddedRestDatasourceRequest } from "api/DatasourcesApi";
export interface DatasourceAuthentication {
  authType?: string;
  username?: string;
  password?: string;
}

export interface DatasourceColumns {
  name: string;
  type: string;
}

export interface DatasourceKeys {
  name: string;
  type: string;
}

export interface DatasourceStructure {
  tables?: DatasourceTable[];
}

export interface QueryTemplate {
  title: string;
  body: string;
}
export interface DatasourceTable {
  type: string;
  name: string;
  columns: DatasourceColumns[];
  keys: DatasourceKeys[];
  templates: QueryTemplate[];
}

// todo: check which fields are truly optional and move the common ones into base
interface BaseDatasource {
  pluginId: string;
  name: string;
  organizationId: string;
  isValid: boolean;
}

export interface EmbeddedRestDatasource extends BaseDatasource {
  datasourceConfiguration: { url: string };
  invalids: Array<string>;
  organizationId: string;
}
export interface Datasource extends BaseDatasource {
  id: string;
  datasourceConfiguration: {
    url: string;
    authentication?: DatasourceAuthentication;
    properties?: Record<string, string>;
    headers?: Property[];
    databaseName?: string;
  };
  invalids?: string[];
  structure?: DatasourceStructure;
}

export const DEFAULT_DATASOURCE = (
  pluginId: string,
  organizationId: string,
): EmbeddedRestDatasource => ({
  name: "DEFAULT_REST_DATASOURCE",
  datasourceConfiguration: {
    url: "",
  },
  invalids: [],
  isValid: true,
  pluginId,
  organizationId,
});
