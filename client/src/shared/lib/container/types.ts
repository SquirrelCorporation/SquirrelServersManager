/**
 * Container Domain Types
 * Shared type definitions for container-related functions
 */

export interface Container {
  id: string;
  name: string;
  image: string;
  status: 'running' | 'stopped' | 'restarting' | 'paused' | 'exited' | 'created';
  ports: Array<{
    private: number;
    public?: number;
    type: 'tcp' | 'udp';
  }>;
  volumes: Array<{
    source: string;
    target: string;
    type: 'bind' | 'volume';
  }>;
  networks: string[];
  labels: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
  stats?: {
    cpu: number;
    memory: number;
    network: { rx: number; tx: number };
  };
}

export interface ContainerFilters {
  search?: string;
  status?: string[];
  showStopped?: boolean;
  hasExposedPorts?: boolean;
  hasVolumes?: boolean;
}

export interface ContainerConfig {
  name: string;
  image: string;
  ports?: Array<{ private: number; public?: number; type: 'tcp' | 'udp' }>;
  volumes?: Array<{ source: string; target: string; type: 'bind' | 'volume' }>;
  environment?: Record<string, string>;
}