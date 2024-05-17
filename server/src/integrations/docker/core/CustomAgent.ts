import http from 'http';
import ssh2 from 'ssh2';
import logger from '../../../logger';

export const getCustomAgent = (opt: any) => {
  const conn = new ssh2.Client();
  const cAgent = new http.Agent();
  // @ts-expect-error creating a new function
  cAgent.createConnection = function (options, fn) {
    conn
      .once('ready', function () {
        conn.exec('docker system dial-stdio', function (err, stream) {
          if (err) {
            conn.end();
            cAgent.destroy();
            return;
          }

          fn(null, stream);

          stream.once('close', () => {
            conn.end();
            cAgent.destroy();
          });
        });
      })
      .on('error', (err) => {
        logger.error(err);
        fn(err);
      })
      .connect(opt);

    conn.once('end', () => cAgent.destroy());
  };

  return cAgent;
};
