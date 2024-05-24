import { Agent } from 'http';
import { Client } from 'ssh2';

export const getCustomAgent = (childLogger: any, opt: any) => {
  class SsmSshAgent extends Agent {
    public client: Client;
    public options: any;

    constructor() {
      super();
      this.client = new Client();
      this.setMaxListeners(20);
      this.options = opt;
    }
    handleError(err: any) {
      console.log('------------------  handlerrror');
      this.client.end();
      this.destroy();
      throw err;
    }
    createConnection(options, fn) {
      this.client
        .once('ready', () => {
          this.client.exec('docker system dial-stdio', (err, stream) => {
            if (err) {
              this.handleError(err);
            }

            fn(null, stream);
            stream.addListener('error', (err) => {
              this.handleError(err);
            });
            stream.once('close', () => {
              this.client.end();
              this.destroy();
            });
          });
        })
        .on('error', (err) => {
          //childLogger.error(`Error connecting to ${opt.host}`);
          //childLogger.error(err);
          fn(err);
        })
        .connect(opt);

      this.client.once('end', () => this.destroy());
    }
  }
  return new SsmSshAgent();
};
