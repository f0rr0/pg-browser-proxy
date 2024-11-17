export interface ClientConfig {
  wsPort?: number;
  wsHost?: string;
}

export const DEFAULT_CONFIG: Required<ClientConfig> = {
  wsPort: 443,
  wsHost: "localhost",
};

export function resolveConfig(config?: ClientConfig): Required<ClientConfig> {
  return {
    wsPort: config?.wsPort ?? DEFAULT_CONFIG.wsPort,
    wsHost: config?.wsHost ?? DEFAULT_CONFIG.wsHost,
  };
}
