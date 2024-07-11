// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import pino from 'pino';
import { Client } from 'ssh2';
import ssh2 from 'ssh2';
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
          // eslint-disable-next-line class-methods-use-this
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
                this.logger.error('Encountering an exec SSH error');
                this.logger.error(err);
                handleError(err);
              }
              stream.addListener('error', (err) => {
                this.logger.error('Encountering an stream SSH error');
                this.logger.error(err);
                handleError(err);
              });
              stream.once('close', () => {
                this.logger.warn('Stream closed');
                conn.end();
                this.destroy();
              });
              return fn(null, decorateHttpStream(stream));
            });
          })
          .on('error', (err) => {
            this.logger.error(`Error connecting to ${opt.host}`);
            this.logger.error(err);
            fn(err);
          })
          .once('end', () => {
            this.logger.warn('Agent destroy');
            conn.end();
            this.destroy();
          })
          .connect(opt);
      } catch (error: any) {
        this.logger.error(error);
      }
    }
  }
  return new SsmSshAgent();
};
/*
  const cAgent = new ssh2.HTTPAgent(opt, { keepAlive: true });
  // @ts-expect-error creating a new function
  cAgent.createConnection = function (options, fn) {
    try {
      const conn = new Client();

      const handleError = (err: any) => {
        //   conn.end();
        //  cAgent.destroy();
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
        .once('ready', function () {
          conn.exec('docker system dial-stdio', function (err, stream) {
            if (err) {
              childLogger.error('Encountering an exec SSH error');
              childLogger.error(err);
              conn.end();
              cAgent.destroy();
              handleError(err);
            }
            stream.addListener('error', (err) => {
              childLogger.error('Encountering an stream SSH error');
              childLogger.error(err);
              conn.end();
              cAgent.destroy();
              handleError(err);
            });
            stream.once('close', () => {
              childLogger.error('Stream closed');
              conn.end();
              cAgent.destroy();
            });
            return fn(null, decorateHttpStream(stream));
          });
        })
        .on('error', (err) => {
          childLogger.error(`Error connecting to ${opt.host}`);
          childLogger.error(err);
          fn(err);
        })
        .once('end', () => {
          childLogger.error('Agent destroy');
          conn.end();
          cAgent.destroy();
        })
        .connect(opt);
    } catch (error) {
      childLogger.error('Uncatch error');
      childLogger.error(error);
      fn(error);
    }
  };
  return cAgent;*/
