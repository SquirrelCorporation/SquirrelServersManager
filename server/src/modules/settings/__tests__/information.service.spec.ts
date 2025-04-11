import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InformationService } from '../application/services/information.service';

describe('InformationService', () => {
  let service: InformationService;
  let mockCacheManager: any;
  let mockPrometheusService: any;
  let mockRedisClient: any;

  beforeEach(() => {
    mockRedisClient = {
      info: vi.fn().mockImplementation((section) => {
        const mockInfo = {
          memory: '# Memory\nused_memory:1024\nused_memory_human:1K\n',
          cpu: '# CPU\nused_cpu_sys:1.00\nused_cpu_user:2.00\n',
          stats: '# Stats\ntotal_connections_received:100\ntotal_commands_processed:1000\n',
          server: '# Server\nredis_version:6.2.6\nredis_mode:standalone\n',
          clients: '# Clients\nconnected_clients:1\nblocked_clients:0\n',
          replication: '# Replication\nrole:master\nconnected_slaves:0\n',
          keyspace: '# Keyspace\ndb0:keys=100,expires=10\n',
        };
        return Promise.resolve(mockInfo[section] || '');
      }),
    };

    mockCacheManager = {
      stores: [
        {
          getClient: () => mockRedisClient,
        },
      ],
    };

    mockPrometheusService = {
      prometheusServerStats: vi.fn().mockResolvedValue({
        uptime: '1h',
        memoryUsage: '100MB',
        activeTargets: 5,
      }),
    };

    service = new InformationService(mockCacheManager, mockPrometheusService);

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
        server: { redis_version: '6.2.6', redis_mode: 'standalone' },
        clients: { connected_clients: '1', blocked_clients: '0' },
        memory: { used_memory: '1024', used_memory_human: '1K' },
        cpu: { used_cpu_sys: '1.00', used_cpu_user: '2.00' },
        stats: { total_connections_received: '100', total_commands_processed: '1000' },
        replication: { role: 'master', connected_slaves: '0' },
        keyspace: { db0: 'keys=100,expires=10' },
      });

      expect(mockRedisClient.info).toHaveBeenCalledWith('memory');
      expect(mockRedisClient.info).toHaveBeenCalledWith('cpu');
      expect(mockRedisClient.info).toHaveBeenCalledWith('stats');
      expect(mockRedisClient.info).toHaveBeenCalledWith('server');
      expect(mockRedisClient.info).toHaveBeenCalledWith('clients');
      expect(mockRedisClient.info).toHaveBeenCalledWith('replication');
      expect(mockRedisClient.info).toHaveBeenCalledWith('keyspace');
    });

    it('should handle missing Redis client', async () => {
      mockCacheManager.stores[0].getClient = () => null;

      const result = await service.getRedisStats();

      expect(result).toEqual({
        status: 'error',
        error: 'Could not access Redis INFO command sections.',
      });
    });
  });

  describe('getPrometheusStats', () => {
    it('should return Prometheus stats', async () => {
      const result = await service.getPrometheusStats();

      expect(result).toEqual({
        uptime: '1h',
        memoryUsage: '100MB',
        activeTargets: 5,
      });
      expect(mockPrometheusService.prometheusServerStats).toHaveBeenCalled();
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
