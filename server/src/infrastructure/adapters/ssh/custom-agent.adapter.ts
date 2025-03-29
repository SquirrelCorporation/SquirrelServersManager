import pino from 'pino';
import ssh2, { Client } from 'ssh2';
import { tryResolveHost } from '../../common/dns/dns.util';
import Logger = pino.Logger;

export const getCustomAgent = (childLogger: any, opt: any) => {
  class SsmSshAgent extends ssh2.HTTPAgent {
    public logger: Logger<never>;

    constructor() {
      super(opt, { keepAlive: true });
      this.setMaxListeners(20);
      this.logger = childLogger.child(
        { module: 'SsmSshDockerAgent', moduleId: `${opt.host}` },
        { msgPrefix: '[SSH] - ' },
      );
    }

    createConnection(options, fn) {
      try {
        const conn = new Client();

        const handleError = (err: any) => {
          conn.end();
          this.destroy();
          throw err;
        };
        const decorateHttpStream = (stream) => {
          stream.setKeepAlive = () => {};
          stream.setNoDelay = () => {};
          stream.setTimeout = () => {};
          stream.ref = () => {};
          stream.unref = () => {};
          stream.destroySoon = stream.destroy;
          return stream;
        };
        conn
          .once('ready', () => {
            conn.exec('docker system dial-stdio', (err, stream) => {
              if (err) {
                this.logger.error(`Encountering an exec SSH error - (host: ${opt.host})`);
                this.logger.error(err);
                handleError(err);
              }
              stream.addListener('error', (err) => {
                this.logger.error(`Encountering an stream SSH error - (host: ${opt.host})`);
                this.logger.error(err);
                handleError(err);
              });
              stream.once('close', () => {
                this.logger.warn(`Stream closed - (host: ${opt.host})`);
                conn.end();
                this.destroy();
              });
              return fn(null, decorateHttpStream(stream));
            });
          })
          .on('error', (err) => {
            this.logger.error(`Error connecting to ${opt.host} : ${err.message}`);
            fn(err);
          })
          .once('end', () => {
            this.logger.warn(`Agent destroy for ${opt.host}`);
            conn.end();
            this.destroy();
          });
        (async () => {
          const resolvedHost = await tryResolveHost(opt.host as string);
          const connectConfig = { ...opt, host: resolvedHost };
          this.logger.info(`Connecting to ${connectConfig.host}`);
          conn.connect(connectConfig);
        })();
      } catch (error: any) {
        this.logger.error(`Error connecting to ${opt.host} : ${error.message}`);
        this.logger.error(error);
      }
    }
  }
  return new SsmSshAgent();
};
