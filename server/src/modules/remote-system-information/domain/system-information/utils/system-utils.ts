// ==================================================================================
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2024
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================

import logger from '../../../../../logger';
import { RemoteExecOptions } from '../../types/remote-executor.types';

export function getValue(
  lines: any[],
  property: string,
  separator = ':',
  trimmed = false,
  lineMatch = false,
) {
  property = property.toLowerCase();
  let result: any = '';
  lines.some((line) => {
    let lineLower = line.toLowerCase().replace(/\t/g, '');
    if (trimmed) {
      lineLower = lineLower.trim();
    }
    if (
      lineLower.startsWith(property) &&
      (lineMatch
        ? lineLower.match(property + separator) || lineLower.match(property + ' ' + separator)
        : true)
    ) {
      const parts = trimmed ? line.trim().split(separator) : line.split(separator);
      if (parts.length >= 2) {
        parts.shift();
        result = parts.join(separator).trim();
        return true;
      }
    }
  });
  return result;
}

export function noop() {}

export const execOptsLinux = {
  maxBuffer: 1024 * 20000,
  encoding: 'utf-8',
  stdio: ['pipe', 'pipe', 'ignore'],
} as RemoteExecOptions;

export function hex2bin(hex: string) {
  return ('00000000' + parseInt(hex, 16).toString(2)).substr(-8);
}

export function cleanString(str: string) {
  return str.replace(/To Be Filled By O.E.M./g, '');
}

export function toInt(value: string) {
  let result = parseInt(value, 10);
  if (isNaN(result)) {
    result = 0;
  }
  return result;
}

export function isFunction(functionToCheck: any) {
  const getType = {};
  return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

export function promiseAll(promises: Promise<any>[]) {
  const resolvingPromises = promises.map(function (promise) {
    return new Promise(function (resolve) {
      const payload: any[] = new Array(2);
      promise
        .then(function (result) {
          payload[0] = result;
        })
        .catch(function (error) {
          payload[1] = error;
        })
        .then(function () {
          // The wrapped Promise returns an array: 0 = result, 1 = error ... we resolve all
          resolve(payload);
        });
    });
  });
  const errors: any[] = [];
  const results: any[] = [];

  // Execute all wrapped Promises
  return Promise.all(resolvingPromises).then(function (items: any) {
    items.forEach((payload: any[]) => {
      if (payload[1]) {
        errors.push(payload[1]);
        results.push(null);
      } else {
        errors.push(null);
        results.push(payload[0]);
      }
    });

    return {
      errors: errors,
      results: results,
    };
  });
}

export const execOptsWin = {
  windowsHide: true,
  maxBuffer: 1024 * 20000,
  encoding: 'utf8',
  env: Object.assign({}, process.env, { LANG: 'en_US.UTF-8' }),
} as RemoteExecOptions;

export const stringReplace = new String().replace;
export const stringToLower = new String().toLowerCase;
export const stringToString = new String().toString;
export const stringSubstr = new String().substr;
export const stringSubstring = new String().substring;
export const stringTrim = new String().trim;
export const stringStartWith = new String().startsWith;
export const stringObj = new String();

export function isPrototypePolluted() {
  const s = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let notPolluted: boolean = true;
  let st = '';

  try {
    const customPrototype = {
      replace: stringReplace,
      toLowerCase: stringToLower,
      toString: stringToString,
      substr: stringSubstr,
      substring: stringSubstring,
      trim: stringTrim,
      startsWith: stringStartWith,
    };

    Object.setPrototypeOf(
      st,
      Object.assign(Object.create(Object.getPrototypeOf(st)), customPrototype),
    );
  } catch (e) {
    logger.error(e);
    Object.setPrototypeOf(st, stringObj); // Fallback to custom prototype
  }
  notPolluted = notPolluted || s.length !== 62;
  const ms = Date.now();
  if (typeof ms === 'number' && ms > 1600000000000) {
    const l = (ms % 100) + 15;
    for (let i = 0; i < l; i++) {
      const r = Math.random() * 61.99999999 + 1;
      const rs = parseInt(Math.floor(r).toString(), 10);
      const rs2 = parseInt(r.toString().split('.')[0], 10);
      const q = Math.random() * 61.99999999 + 1;
      const qs = parseInt(Math.floor(q).toString(), 10);
      const qs2 = parseInt(q.toString().split('.')[0], 10);
      notPolluted = notPolluted && r !== q;
      notPolluted = notPolluted && rs === rs2 && qs === qs2;
      st += s[rs - 1];
    }
    notPolluted = notPolluted && st.length === l;
    // string manipulation
    let p = Math.random() * l * 0.9999999999;
    let stm = st.substr(0, p) + ' ' + st.substr(p, 2000);
    try {
      const customPrototype = {
        replace: stringReplace,
      };
      Object.setPrototypeOf(
        stm,
        Object.assign(Object.create(Object.getPrototypeOf(stm)), customPrototype),
      );
    } catch (e) {
      logger.error(e);
      Object.setPrototypeOf(stm, stringObj);
    }
    let sto = stm.replace(/ /g, '');
    notPolluted = notPolluted && st === sto;
    p = Math.random() * l * 0.9999999999;
    stm = st.substr(0, p) + '{' + st.substr(p, 2000);
    sto = stm.replace(/{/g, '');
    notPolluted = notPolluted && st === sto;
    p = Math.random() * l * 0.9999999999;
    stm = st.substr(0, p) + '*' + st.substr(p, 2000);
    sto = stm.replace(/\*/g, '');
    notPolluted = notPolluted && st === sto;
    p = Math.random() * l * 0.9999999999;
    stm = st.substr(0, p) + '$' + st.substr(p, 2000);
    sto = stm.replace(/\$/g, '');
    notPolluted = notPolluted && st === sto;

    // lower
    const stl = st.toLowerCase();
    notPolluted = notPolluted && stl.length === l && !!stl[l - 1] && !stl[l];
    for (let i = 0; i < l; i++) {
      const s1 = st[i];
      try {
        const customPrototype = {
          toLowerCase: stringToLower,
        };
        Object.setPrototypeOf(
          s1,
          Object.assign(Object.create(Object.getPrototypeOf(s1)), customPrototype),
        );
      } catch (e) {
        logger.error(e);
        Object.setPrototypeOf(st, stringObj);
      }
      const s2 = stl ? stl[i] : '';
      const s1l = s1.toLowerCase();
      notPolluted = notPolluted && s1l[0] === s2 && !!s1l[0] && !s1l[1];
    }
  }
  return !notPolluted;
}

export function sanitizeShellString(str: string, strict?: boolean) {
  if (typeof strict === 'undefined') {
    strict = false;
  }
  const s = str || '';
  let result = '';
  const l = Math.min(s.length, 2000);
  for (let i = 0; i <= l; i++) {
    if (
      !(
        s[i] === undefined ||
        s[i] === '>' ||
        s[i] === '<' ||
        s[i] === '*' ||
        s[i] === '?' ||
        s[i] === '[' ||
        s[i] === ']' ||
        s[i] === '|' ||
        s[i] === '˚' ||
        s[i] === '$' ||
        s[i] === ';' ||
        s[i] === '&' ||
        s[i] === ']' ||
        s[i] === '#' ||
        s[i] === '\\' ||
        s[i] === '\t' ||
        s[i] === '\n' ||
        s[i] === '\r' ||
        s[i] === "'" ||
        s[i] === '`' ||
        s[i] === '"' ||
        s[i].length > 1 ||
        (strict && s[i] === '(') ||
        (strict && s[i] === ')') ||
        (strict && s[i] === '@') ||
        (strict && s[i] === ' ') ||
        (strict && s[i] === '{') ||
        (strict && s[i] === ';') ||
        (strict && s[i] === '}')
      )
    ) {
      result = result + s[i];
    }
  }
  return result;
}

export function plistParser(xmlStr: string) {
  const tags = [
    'array',
    'dict',
    'key',
    'string',
    'integer',
    'date',
    'real',
    'data',
    'boolean',
    'arrayEmpty',
  ];
  const startStr = '<plist version';

  let pos = xmlStr.indexOf(startStr);
  const len = xmlStr.length;
  while (xmlStr[pos] !== '>' && pos < len) {
    pos++;
  }

  let depth = 0;
  let inTagStart = false;
  let inTagContent = false;
  let inTagEnd = false;
  const metaData: Record<string, any> = [
    { tagStart: '', tagEnd: '', tagContent: '', key: '', data: null },
  ];
  let c = '';
  let cn = xmlStr[pos];

  while (pos < len) {
    c = cn;
    if (pos + 1 < len) {
      cn = xmlStr[pos + 1];
    }
    if (c === '<') {
      inTagContent = false;
      if (cn === '/') {
        inTagEnd = true;
      } else if (metaData[depth].tagStart) {
        metaData[depth].tagContent = '';
        if (!metaData[depth].data) {
          metaData[depth].data = metaData[depth].tagStart === 'array' ? [] : {};
        }
        depth++;
        metaData.push({ tagStart: '', tagEnd: '', tagContent: '', key: null, data: null });
        inTagStart = true;
        inTagContent = false;
      } else if (!inTagStart) {
        inTagStart = true;
      }
    } else if (c === '>') {
      if (metaData[depth].tagStart === 'true/') {
        inTagStart = false;
        inTagEnd = true;
        metaData[depth].tagStart = '';
        metaData[depth].tagEnd = '/boolean';
        metaData[depth].data = true;
      }
      if (metaData[depth].tagStart === 'false/') {
        inTagStart = false;
        inTagEnd = true;
        metaData[depth].tagStart = '';
        metaData[depth].tagEnd = '/boolean';
        metaData[depth].data = false;
      }
      if (metaData[depth].tagStart === 'array/') {
        inTagStart = false;
        inTagEnd = true;
        metaData[depth].tagStart = '';
        metaData[depth].tagEnd = '/arrayEmpty';
        metaData[depth].data = [];
      }
      if (inTagContent) {
        inTagContent = false;
      }
      if (inTagStart) {
        inTagStart = false;
        inTagContent = true;
        if (metaData[depth].tagStart === 'array') {
          metaData[depth].data = [];
        }
        if (metaData[depth].tagStart === 'dict') {
          metaData[depth].data = {};
        }
      }
      if (inTagEnd) {
        inTagEnd = false;
        if (metaData[depth].tagEnd && tags.indexOf(metaData[depth].tagEnd.substr(1)) >= 0) {
          if (metaData[depth].tagEnd === '/dict' || metaData[depth].tagEnd === '/array') {
            if (depth > 1 && metaData[depth - 2].tagStart === 'array') {
              metaData[depth - 2].data.push(metaData[depth - 1].data);
            }
            if (depth > 1 && metaData[depth - 2].tagStart === 'dict') {
              metaData[depth - 2].data[metaData[depth - 1].key] = metaData[depth - 1].data;
            }
            depth--;
            metaData.pop();
            metaData[depth].tagContent = '';
            metaData[depth].tagStart = '';
            metaData[depth].tagEnd = '';
          } else {
            if (metaData[depth].tagEnd === '/key' && metaData[depth].tagContent) {
              metaData[depth].key = metaData[depth].tagContent;
            } else {
              if (metaData[depth].tagEnd === '/real' && metaData[depth].tagContent) {
                metaData[depth].data = parseFloat(metaData[depth].tagContent) || 0;
              }
              if (metaData[depth].tagEnd === '/integer' && metaData[depth].tagContent) {
                metaData[depth].data = parseInt(metaData[depth].tagContent) || 0;
              }
              if (metaData[depth].tagEnd === '/string' && metaData[depth].tagContent) {
                metaData[depth].data = metaData[depth].tagContent || '';
              }
              if (metaData[depth].tagEnd === '/boolean') {
                metaData[depth].data = metaData[depth].tagContent || false;
              }
              if (metaData[depth].tagEnd === '/arrayEmpty') {
                metaData[depth].data = metaData[depth].tagContent || [];
              }
              if (depth > 0 && metaData[depth - 1].tagStart === 'array') {
                metaData[depth - 1].data.push(metaData[depth].data);
              }
              if (depth > 0 && metaData[depth - 1].tagStart === 'dict') {
                metaData[depth - 1].data[metaData[depth].key] = metaData[depth].data;
              }
            }
            metaData[depth].tagContent = '';
            metaData[depth].tagStart = '';
            metaData[depth].tagEnd = '';
          }
        }
        metaData[depth].tagEnd = '';
        inTagStart = false;
        inTagContent = false;
      }
    } else {
      if (inTagStart) {
        metaData[depth].tagStart += c;
      }
      if (inTagEnd) {
        metaData[depth].tagEnd += c;
      }
      if (inTagContent) {
        metaData[depth].tagContent += c;
      }
    }
    pos++;
  }
  return metaData[0].data;
}

export function strIsNumeric(str: any) {
  return typeof str === 'string' && !isNaN(parseInt(str)) && !isNaN(parseFloat(str));
}
