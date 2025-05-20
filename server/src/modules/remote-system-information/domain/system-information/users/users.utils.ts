import { Systeminformation } from 'ssm-shared-lib';
import * as util from '../utils/system-utils';

export function parseUsersLinux(lines: string[], phase: number) {
  const result: Systeminformation.UserData[] = [];
  const result_who: Partial<Systeminformation.UserData>[] = [];
  const result_w: Record<string, any> = {};
  let who_line: Record<string, any> = {};

  let w_first = true;
  let w_header: string[] = [];
  const w_pos: number[] = [];

  let is_whopart = true;
  lines.forEach(function (line) {
    if (line === '---') {
      is_whopart = false;
    } else {
      const l = line.replace(/ +/g, ' ').split(' ');

      // who part
      if (is_whopart) {
        result_who.push({
          user: l[0],
          tty: l[1],
          date: l[2],
          time: l[3],
          ip: l && l.length > 4 ? l[4].replace(/\(/g, '').replace(/\)/g, '') : '',
        });
      } else {
        // w part
        if (w_first) {
          // header
          w_header = l;
          w_header.forEach(function (item) {
            w_pos.push(line.indexOf(item));
          });
          w_first = false;
        } else {
          // split by w_pos
          result_w.user = line.substring(w_pos[0], w_pos[1] - 1).trim();
          result_w.tty = line.substring(w_pos[1], w_pos[2] - 1).trim();
          result_w.ip = line
            .substring(w_pos[2], w_pos[3] - 1)
            .replace(/\(/g, '')
            .replace(/\)/g, '')
            .trim();
          result_w.command = line.substring(w_pos[7], 1000).trim();
          // find corresponding 'who' line
          who_line = result_who.filter((obj) => {
            return obj.user?.substring(0, 8).trim() === result_w.user && obj.tty === result_w.tty;
          });
          if (who_line.length === 1) {
            result.push({
              user: who_line[0].user,
              tty: who_line[0].tty,
              date: who_line[0].date,
              time: who_line[0].time,
              ip: who_line[0].ip,
              command: result_w.command,
            });
          }
        }
      }
    }
  });
  if (result.length === 0 && phase === 2) {
    return result_who;
  } else {
    return result;
  }
}

export function parseUsersDarwin(lines: string[]) {
  const result: Systeminformation.UserData[] = [];
  const result_who: Partial<Systeminformation.UserData>[] = [];
  const result_w: Record<string, any> = {};
  let who_line: Record<string, any> = {};

  let is_whopart = true;
  lines.forEach(function (line) {
    if (line === '---') {
      is_whopart = false;
    } else {
      const l = line.replace(/ +/g, ' ').split(' ');

      // who part
      if (is_whopart) {
        let dt =
          '' +
          new Date().getFullYear() +
          '-' +
          (
            '0' +
            ('JANFEBMARAPRMAYJUNJULAUGSEPOCTNOVDEC'.indexOf(l[2].toUpperCase()) / 3 + 1)
          ).slice(-2) +
          '-' +
          ('0' + l[3]).slice(-2);
        try {
          if (new Date(dt) > new Date()) {
            dt =
              '' +
              (new Date().getFullYear() - 1) +
              '-' +
              (
                '0' +
                ('JANFEBMARAPRMAYJUNJULAUGSEPOCTNOVDEC'.indexOf(l[2].toUpperCase()) / 3 + 1)
              ).slice(-2) +
              '-' +
              ('0' + l[3]).slice(-2);
          }
        } catch {
          util.noop();
        }
        result_who.push({
          user: l[0],
          tty: l[1],
          date: dt,
          time: l[4],
        });
      } else {
        // w part
        // split by w_pos
        result_w.user = l[0];
        result_w.tty = l[1];
        result_w.ip = l[2] !== '-' ? l[2] : '';
        result_w.command = l.slice(5, 1000).join(' ');
        // find corresponding 'who' line
        who_line = result_who.filter(function (obj) {
          return (
            obj.user?.substring(0, 10) === result_w.user.substring(0, 10) &&
            (obj.tty?.substring(3, 1000) === result_w.tty || obj.tty === result_w.tty)
          );
        });
        if (who_line.length === 1) {
          result.push({
            user: who_line[0].user,
            tty: who_line[0].tty,
            date: who_line[0].date,
            time: who_line[0].time,
            ip: result_w.ip,
            command: result_w.command,
          });
        }
      }
    }
  });
  return result;
}

export function parseWinSessions(sessionParts: string[]) {
  const sessions: Record<string, any> = {};
  sessionParts.forEach((session) => {
    const lines = session.split('\r\n');
    const id = util.getValue(lines, 'LogonId');
    const starttime = util.getValue(lines, 'starttime');
    if (id) {
      sessions[id] = starttime;
    }
  });
  return sessions;
}

export function fuzzyMatch(name1: string, name2: string) {
  name1 = name1.toLowerCase();
  name2 = name2.toLowerCase();
  let eq = 0;
  let len = name1.length;
  if (name2.length > len) {
    len = name2.length;
  }

  for (let i = 0; i < len; i++) {
    const c1 = name1[i] || '';
    const c2 = name2[i] || '';
    if (c1 === c2) {
      eq++;
    }
  }
  return len > 10 ? eq / len > 0.9 : len > 0 ? eq / len > 0.8 : false;
}

export function parseWinUsers(userParts: string[], userQuery: any[]) {
  const users: Partial<Systeminformation.UserData>[] = [];
  userParts.forEach((user) => {
    const lines = user.split('\r\n');

    const domain = util.getValue(lines, 'domain', ':', true);
    const username = util.getValue(lines, 'user', ':', true);
    const sessionid = util.getValue(lines, 'sessionid', ':', true);

    if (username) {
      const quser = userQuery.filter((item) => fuzzyMatch(item.user, username));
      users.push({
        domain,
        user: username,
        tty: quser && quser[0] && quser[0].tty ? quser[0].tty : sessionid,
      });
    }
  });
  return users;
}

export function parseWinLoggedOn(loggedonParts: Record<string, any>) {
  const loggedons: Record<string, any> = {};
  loggedonParts.forEach((loggedon: string) => {
    const lines = loggedon.split('\r\n');

    const antecendent = util.getValue(lines, 'antecedent', ':', true);
    let parts = antecendent.split('=');
    const name = parts.length > 2 ? parts[1].split(',')[0].replace(/"/g, '').trim() : '';
    const domain = parts.length > 2 ? parts[2].replace(/"/g, '').replace(/\)/g, '').trim() : '';
    const dependent = util.getValue(lines, 'dependent', ':', true);
    parts = dependent.split('=');
    const id = parts.length > 1 ? parts[1].replace(/"/g, '').replace(/\)/g, '').trim() : '';
    if (id) {
      loggedons[id] = {
        domain,
        user: name,
      };
    }
  });
  return loggedons;
}

export function parseWinUsersQuery(lines: string[]) {
  lines = lines.filter((item) => item);
  const result: Partial<Systeminformation.UserData>[] = [];
  const header = lines[0];
  const headerDelimiter: number[] = [];
  if (header) {
    const start = header[0] === ' ' ? 1 : 0;
    headerDelimiter.push(start - 1);
    let nextSpace = 0;
    for (let i = start + 1; i < header.length; i++) {
      if (header[i] === ' ' && (header[i - 1] === ' ' || header[i - 1] === '.')) {
        nextSpace = i;
      } else {
        if (nextSpace) {
          headerDelimiter.push(nextSpace);
          nextSpace = 0;
        }
      }
    }
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const user = lines[i].substring(headerDelimiter[0] + 1, headerDelimiter[1]).trim() || '';
        const tty = lines[i].substring(headerDelimiter[1] + 1, headerDelimiter[2] - 2).trim() || '';
        result.push({
          user: user,
          tty: tty,
        });
      }
    }
  }
  return result;
}
