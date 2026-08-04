export interface ConnectorCredentialField {
  key: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  helpText?: string;
}

export interface CatalogEntry {
  key: string;
  displayName: string;
  authKind: string;
  icon: string;
  credentialFields?: ConnectorCredentialField[];
}

export interface Connection {
  id?: string;
  connectorKey: string;
  authKind: string;
  accountEmail?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ConnectorsState {
  catalog: CatalogEntry[];
  connections: Connection[];
}

export const AuthKind = {
  OAUTH: "oauth",
  API_KEY: "apiKey",
};
