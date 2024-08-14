import stream from 'stream';
import Dockerode from 'dockerode';
import DockerImages from './AbstractDockerImages';

export default class DockerLogs extends DockerImages {
  dockerApi: Dockerode | undefined = undefined;

  public getContainerLiveLogs(containerId: string, from: number, callback: (data: string) => void) {
    const container = (this.dockerApi as Dockerode).getContainer(containerId);
    if (container) {
      const logStream = new stream.PassThrough();
      logStream.on('data', (chunk) => {
        this.childLogger.debug(chunk.toString('utf8'));
        callback(chunk.toString('utf8'));
      });
      container.logs(
        { stderr: true, stdout: true, follow: true, since: from, timestamps: true },
        (err, stream) => {
          if (err) {
            this.childLogger.error(err.message);
            return;
          }
          if (stream) {
            (this.dockerApi as Dockerode).modem.demuxStream(stream, logStream, logStream);
            stream.on('end', () => {
              this.childLogger.info(`Logs stream for container ${containerId} ended`);
              logStream.end('!stop!');
            });
          } else {
            throw new Error(`Stream is null for requested containerId ${containerId}`);
          }
        },
      );
      return () => {
        logStream.end();
      };
    } else {
      throw new Error(`Container not found for ${containerId}`);
    }
  }
}
