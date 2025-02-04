import { Systeminformation } from 'ssm-shared-lib';
import PinoLogger from '../../../../logger';
import { RemoteOS } from '../RemoteOS';
import { Callback, RemoteExecutorType, RemoteExecutorTypeWithCallback } from '../types';
import { parseUsersDarwin, parseUsersLinux } from './users.utils';

export default class UsersComponent extends RemoteOS {
  private logger = PinoLogger.child({ component: 'UsersComponent' });
  constructor(
    remoteExecAsync: RemoteExecutorType,
    remoteExecWithCallback: RemoteExecutorTypeWithCallback,
  ) {
    super(remoteExecAsync, remoteExecWithCallback);
  }

  public users(callback?: Callback) {
    return new Promise((resolve) => {
      process.nextTick(() => {
        let result: Partial<Systeminformation.UserData>[] = [];

        // linux
        if (this.platform === 'linux') {
          this.execWithCallback(
            'export LC_ALL=C; who --ips; echo "---"; w; unset LC_ALL | tail -n +2',
            (error, stdout) => {
              if (!error) {
                // lines / split
                let lines = stdout.toString().split('\n');
                result = parseUsersLinux(lines, 1);
                if (result.length === 0) {
                  this.execWithCallback('who; echo "---"; w | tail -n +2', (error, stdout) => {
                    this.logger.error(stdout.toString());
                    if (!error) {
                      // lines / split
                      lines = stdout.toString().split('\n');
                      result = parseUsersLinux(lines, 2);
                    }
                    if (callback) {
                      callback(result);
                    }
                    resolve(result);
                  });
                } else {
                  if (callback) {
                    callback(result);
                  }
                  resolve(result);
                }
              } else {
                if (callback) {
                  callback(result);
                }
                resolve(result);
              }
            },
          );
        }
        if (
          this.platform === 'freebsd' ||
          this.platform === 'openbsd' ||
          this.platform === 'netbsd'
        ) {
          this.execWithCallback('who; echo "---"; w -ih', (error, stdout) => {
            if (!error) {
              // lines / split
              const lines = stdout.toString().split('\n');
              result = parseUsersDarwin(lines);
            }
            if (callback) {
              callback(result);
            }
            resolve(result);
          });
        }
        if (this.platform === 'sunos') {
          this.execWithCallback('who; echo "---"; w -h', (error, stdout) => {
            if (!error) {
              // lines / split
              const lines = stdout.toString().split('\n');
              result = parseUsersDarwin(lines);
            }
            if (callback) {
              callback(result);
            }
            resolve(result);
          });
        }

        if (this.platform === 'darwin') {
          this.execWithCallback(
            'export LC_ALL=C; who; echo "---"; w -ih; unset LC_ALL',
            (error, stdout) => {
              if (!error) {
                // lines / split
                const lines = stdout.toString().split('\n');
                result = parseUsersDarwin(lines);
              }
              if (callback) {
                callback(result);
              }
              resolve(result);
            },
          );
        }
        if (this.platform === 'win32') {
          if (callback) {
            callback(result);
          }
          resolve(result);
          /*
          try {
            let cmd = 'Get-CimInstance Win32_LogonSession | select LogonId,@{n="StartTime";e={$_.StartTime.ToString("yyyy-MM-dd HH:mm:ss")}} | fl' + '; echo \'#-#-#-#\';';
            cmd += 'Get-CimInstance Win32_LoggedOnUser | select antecedent,dependent | fl ' + '; echo \'#-#-#-#\';';
            cmd += '$process = (Get-CimInstance Win32_Process -Filter "name = \'explorer.exe\'"); Invoke-CimMethod -InputObject $process[0] -MethodName GetOwner | select user, domain | fl; get-process -name explorer | select-object sessionid | fl; echo \'#-#-#-#\';';
            cmd += 'query user';
            util.powerShell(cmd).then((data) => {
              if (data) {
                data = data.split('#-#-#-#');
                let sessions = parseWinSessions((data[0] || '').split(/\n\s*\n/));
                let loggedons = parseWinLoggedOn((data[1] || '').split(/\n\s*\n/));
                let queryUser = parseWinUsersQuery((data[3] || '').split('\r\n'));
                let users = parseWinUsers((data[2] || '').split(/\n\s*\n/), queryUser);
                for (let id in loggedons) {
                  if ({}.hasOwnProperty.call(loggedons, id)) {
                    loggedons[id].dateTime = {}.hasOwnProperty.call(sessions, id) ? sessions[id] : '';
                  }
                }
                users.forEach(user => {
                  let dateTime = '';
                  for (let id in loggedons) {
                    if ({}.hasOwnProperty.call(loggedons, id)) {
                      if (loggedons[id].user === user.user && (!dateTime || dateTime < loggedons[id].dateTime)) {
                        dateTime = loggedons[id].dateTime;
                      }
                    }
                  }

                  result.push({
                    user: user.user,
                    tty: user.tty,
                    date: `${dateTime.substring(0, 10)}`,
                    time: `${dateTime.substring(11, 19)}`,
                    ip: '',
                    command: ''
                  });
                });
              }
              if (callback) { callback(result); }
              resolve(result);

            });
          } catch (e) {
            if (callback) { callback(result); }
            resolve(result);
          }

           */
        }
      });
    });
  }
}
