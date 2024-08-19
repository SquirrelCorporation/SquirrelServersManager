import stream from 'stream';
import Dockerode from 'dockerode';
import DockerImages from './AbstractDockerImages';

export default class DockerLogs extends DockerImages {
  dockerApi: Dockerode | undefined = undefined;

  /**
   * Fetch live logs from a Docker container
   * @param containerId - ID of the Docker container
   * @param from - Timestamp indicating the start time for fetching logs
   * @param callback - Function to handle the log data
   * @returns Function to stop the log stream
   */
  public getContainerLiveLogs(containerId: string, from: number, callback: (data: string) => void) {
    const container = (this.dockerApi as Dockerode)?.getContainer(containerId);
    if (!container) {
      throw new Error(`Container not found for ${containerId}`);
    }

    const logStream = this.createLogStream(callback);
    this.fetchLogs(container, from, logStream, containerId);

    return () => {
      logStream.end();
    };
  }

  private createLogStream(callback: (data: string) => void): stream.PassThrough {
    const logStream = new stream.PassThrough();
    logStream.on('data', (chunk) => {
      const logData = chunk.toString('utf8');
      this.childLogger.debug(logData);
      callback(logData);
    });
    return logStream;
  }

  private fetchLogs(
    container: Dockerode.Container,
    from: number,
    logStream: stream.PassThrough,
    containerId: string,
  ) {
    container.logs(
      { stderr: true, stdout: true, follow: true, since: from, timestamps: true },
      (err, logStreamResult) => {
        if (err) {
          this.childLogger.error(err.message);
          return;
        }
        if (!logStreamResult) {
          throw new Error(`Stream is null for requested containerId ${containerId}`);
        }
        const dockerModem = (this.dockerApi as Dockerode).modem;
        dockerModem.demuxStream(logStreamResult, logStream, logStream);
        logStreamResult.on('end', () => {
          this.childLogger.info(`Logs stream for container ${containerId} ended`);
          logStream.end('!stop!');
        });
      },
    );
  }
}
