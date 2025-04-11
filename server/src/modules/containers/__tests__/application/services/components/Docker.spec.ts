import { describe, expect, test } from 'vitest';
import '../../../test-setup';
import { DockerWatcherComponent } from '@modules/containers/application/services/components/watcher/providers/docker/docker-watcher.component';

describe('Docker Watcher Component Tests', () => {
  test('findNewVersion should detect newer versions', async () => {
    const dockerWatcher = new DockerWatcherComponent();
    
    // Test with container that has an update available
    const container = {
      id: 'container-123',
      image: {
        tag: {
          value: '1.2.3'
        }
      }
    };
    
    const result = await dockerWatcher.findNewVersion(container);
    expect(result).toEqual({ tag: '1.2.4' });
    
    // Test with container that doesn't have an update
    const upToDateContainer = {
      id: 'container-456',
      image: {
        tag: {
          value: '1.2.4'
        }
      }
    };
    
    const upToDateResult = await dockerWatcher.findNewVersion(upToDateContainer);
    expect(upToDateResult).toEqual({ tag: '1.2.4' });
  });
  
  test('container report should reflect update availability', async () => {
    const dockerWatcher = new DockerWatcherComponent();
    
    // Container with available update
    const containerWithUpdate = {
      id: 'container-123',
      image: {
        tag: {
          value: '1.2.3'
        }
      },
      result: {
        tag: '1.2.4'
      }
    };
    
    const reportWithUpdate = await dockerWatcher.mapContainerToContainerReport(containerWithUpdate);
    expect(reportWithUpdate).toMatchObject({
      changed: true,
      container: {
        id: 'container-123',
        updateAvailable: true
      }
    });
    
    // Container without available update
    const containerWithoutUpdate = {
      id: 'container-456',
      image: {
        tag: {
          value: '1.2.3'
        }
      },
      result: {
        tag: '1.2.3'
      }
    };
    
    const reportWithoutUpdate = await dockerWatcher.mapContainerToContainerReport(containerWithoutUpdate);
    expect(reportWithoutUpdate).toMatchObject({
      changed: true,
      container: {
        id: 'container-456',
        updateAvailable: false
      }
    });
    
    // Error case - missing result
    const containerWithError = {
      id: 'container-789',
      image: {
        tag: {
          value: '1.2.3'
        }
      }
    };
    
    const reportWithError = await dockerWatcher.mapContainerToContainerReport(containerWithError);
    expect(reportWithError).toMatchObject({
      changed: true,
      container: {
        id: 'container-789',
        updateAvailable: false
      }
    });
  });
});
