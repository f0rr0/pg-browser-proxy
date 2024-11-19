export interface ClientConfig {
  wsPort?: number;
  wsHost?: string;
  silent?: boolean;
}

export const DEFAULT_CONFIG: Required<ClientConfig> = {
  wsPort: 443,
  wsHost: "localhost",
  silent: false,
};

export function resolveConfig(config?: ClientConfig): Required<ClientConfig> {
  return {
    wsPort: config?.wsPort ?? DEFAULT_CONFIG.wsPort,
    wsHost: config?.wsHost ?? DEFAULT_CONFIG.wsHost,
    silent: config?.silent ?? DEFAULT_CONFIG.silent,
  };
}
