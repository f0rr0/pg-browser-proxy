export interface ProxyConfig {
  tcpPort?: number;
  wsPort?: number;
}

export const DEFAULT_CONFIG: Required<ProxyConfig> = {
  tcpPort: 5432,
  wsPort: 443,
};

export function resolveConfig(config?: ProxyConfig): Required<ProxyConfig> {
  return {
    tcpPort: config?.tcpPort ?? DEFAULT_CONFIG.tcpPort,
    wsPort: config?.wsPort ?? DEFAULT_CONFIG.wsPort,
  };
}
