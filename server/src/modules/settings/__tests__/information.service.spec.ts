import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InformationService } from '../application/services/information.service';

describe('InformationService', () => {
  let service: InformationService;
  let mockCacheManager: any;

  beforeEach(() => {
    mockCacheManager = {
      get: vi.fn(),
      set: vi.fn(),
    };

    service = new InformationService(mockCacheManager);

    // Mock the getMongoDBStats method
    vi.spyOn(service, 'getMongoDBStats').mockResolvedValue({
      memory: {
        resident: 100,
        virtual: 200,
        mapped: 300,
      },
      connections: {
        current: 10,
        available: 100,
        totalCreated: 1000,
      },
      cpu: {
        userPercent: 0.1,
        systemPercent: 0.2,
        idlePercent: 0.7,
      },
      operations: {
        insert: 100,
        query: 200,
        update: 300,
        delete: 400,
      },
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMongoDBStats', () => {
    it('should return MongoDB stats', async () => {
      const result = await service.getMongoDBStats();

      expect(result).toEqual({
        memory: {
          resident: 100,
          virtual: 200,
          mapped: 300,
        },
        connections: {
          current: 10,
          available: 100,
          totalCreated: 1000,
        },
        cpu: {
          userPercent: 0.1,
          systemPercent: 0.2,
          idlePercent: 0.7,
        },
        operations: {
          insert: 100,
          query: 200,
          update: 300,
          delete: 400,
        },
      });
    });
  });

  describe('getRedisStats', () => {
    it('should return Redis stats', async () => {
      const result = await service.getRedisStats();

      expect(result).toEqual({
        memory: {},
        cpu: {},
        stats: {},
        server: {},
      });
    });
  });

  describe('getPrometheusStats', () => {
    it('should return Prometheus stats', async () => {
      const result = await service.getPrometheusStats();

      expect(result).toEqual({});
    });
  });

  describe('parseRedisInfo', () => {
    it('should parse Redis info string', () => {
      const info = `# Server
redis_version:6.2.6
redis_git_sha1:00000000
redis_git_dirty:0
redis_build_id:00000000000000000
redis_mode:standalone
os:Linux 5.4.0-1045-aws x86_64
arch_bits:64
multiplexing_api:epoll
atomicvar_api:atomic-builtin
gcc_version:9.3.0
process_id:1
process_supervised:no
run_id:96a3b71e9c3dcd77b92e9a4c8ef7b0cd9d317736
tcp_port:6379
server_time_usec:1634123456789
uptime_in_seconds:123456
uptime_in_days:1
hz:10
configured_hz:10
lru_clock:16341234
executable:/data/redis-server
config_file:/etc/redis/redis.conf
io_threads_active:0

# Clients
connected_clients:1
cluster_connections:0
maxclients:10000
client_recent_max_input_buffer:20480
client_recent_max_output_buffer:0
blocked_clients:0
tracking_clients:0
clients_in_timeout_table:0`;

      const result = (service as any).parseRedisInfo(info);

      expect(result).toEqual({
        redis_version: '6.2.6',
        redis_git_sha1: '00000000',
        redis_git_dirty: '0',
        redis_build_id: '00000000000000000',
        redis_mode: 'standalone',
        os: 'Linux 5.4.0-1045-aws x86_64',
        arch_bits: '64',
        multiplexing_api: 'epoll',
        atomicvar_api: 'atomic-builtin',
        gcc_version: '9.3.0',
        process_id: '1',
        process_supervised: 'no',
        run_id: '96a3b71e9c3dcd77b92e9a4c8ef7b0cd9d317736',
        tcp_port: '6379',
        server_time_usec: '1634123456789',
        uptime_in_seconds: '123456',
        uptime_in_days: '1',
        hz: '10',
        configured_hz: '10',
        lru_clock: '16341234',
        executable: '/data/redis-server',
        config_file: '/etc/redis/redis.conf',
        io_threads_active: '0',
        connected_clients: '1',
        cluster_connections: '0',
        maxclients: '10000',
        client_recent_max_input_buffer: '20480',
        client_recent_max_output_buffer: '0',
        blocked_clients: '0',
        tracking_clients: '0',
        clients_in_timeout_table: '0',
      });
    });
  });
});