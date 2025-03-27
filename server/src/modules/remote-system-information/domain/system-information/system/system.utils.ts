// ==================================================================================
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2024
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================

import { appleModelIds } from './system.consts';

export function macOsChassisType(model: string) {
  model = model.toLowerCase();
  if (model.indexOf('macbookair') >= 0 || model.indexOf('macbook air') >= 0) {
    return 'Notebook';
  }
  if (model.indexOf('macbookpro') >= 0 || model.indexOf('macbook pro') >= 0) {
    return 'Notebook';
  }
  if (model.indexOf('macbook') >= 0) {
    return 'Notebook';
  }
  if (model.indexOf('macmini') >= 0 || model.indexOf('mac mini') >= 0) {
    return 'Desktop';
  }
  if (model.indexOf('imac') >= 0) {
    return 'Desktop';
  }
  if (model.indexOf('macstudio') >= 0 || model.indexOf('mac studio') >= 0) {
    return 'Desktop';
  }
  if (model.indexOf('macpro') >= 0 || model.indexOf('mac pro') >= 0) {
    return 'Tower';
  }
  return 'Other';
}

export function cleanDefaults(s: string) {
  const cmpStr = s.toLowerCase();
  if (
    cmpStr.indexOf('o.e.m.') === -1 &&
    cmpStr.indexOf('default string') === -1 &&
    cmpStr !== 'default'
  ) {
    return s || '';
  }
  return '';
}

export function getAppleModel(key: string) {
  const list = appleModelIds.filter((model) => model.key === key);
  if (list.length === 0) {
    return {
      key: key,
      model: 'Apple',
      version: 'Unknown',
    };
  }
  const features: string[] = [];
  if (list[0].size) {
    features.push(list[0].size);
  }
  if (list[0].processor) {
    features.push(list[0].processor);
  }
  if (list[0].year) {
    features.push(list[0].year);
  }
  if (list[0].additional) {
    features.push(list[0].additional);
  }
  return {
    key: key,
    model: list[0].name,
    version: list[0].name + ' (' + features.join(', ') + ')',
  };
}

function detectSplit(str: string) {
  let seperator = '';
  let part = 0;
  str.split('').forEach((element) => {
    if (element >= '0' && element <= '9') {
      if (part === 1) {
        part++;
      }
    } else {
      if (part === 0) {
        part++;
      }
      if (part === 1) {
        seperator += element;
      }
    }
  });
  return seperator;
}

function parseTime(t: string, pmDesignator: string) {
  pmDesignator = pmDesignator || '';
  t = t.toUpperCase();
  let hour = 0;
  let min = 0;
  const splitter = detectSplit(t);
  const parts = t.split(splitter);
  if (parts.length >= 2) {
    if (parts[2]) {
      parts[1] += parts[2];
    }
    const isPM =
      (parts[1] && parts[1].toLowerCase().indexOf('pm') > -1) ||
      parts[1].toLowerCase().indexOf('p.m.') > -1 ||
      parts[1].toLowerCase().indexOf('p. m.') > -1 ||
      parts[1].toLowerCase().indexOf('n') > -1 ||
      parts[1].toLowerCase().indexOf('ch') > -1 ||
      parts[1].toLowerCase().indexOf('ös') > -1 ||
      (pmDesignator && parts[1].toLowerCase().indexOf(pmDesignator) > -1);
    hour = parseInt(parts[0], 10);
    min = parseInt(parts[1], 10);
    hour = isPM && hour < 12 ? hour + 12 : hour;
    return ('0' + hour).substr(-2) + ':' + ('0' + min).substr(-2);
  }
}

export function parseDateTime(dt: string, culture?: any) {
  const result: { date?: string; time?: string } = {
    date: '',
    time: '',
  };
  culture = culture || {};
  const dateFormat = (culture.dateFormat || '').toLowerCase();
  const pmDesignator = culture.pmDesignator || '';

  const parts = dt.split(' ');
  if (parts[0]) {
    if (parts[0].indexOf('/') >= 0) {
      // Dateformat: mm/dd/yyyy or dd/mm/yyyy or dd/mm/yy or yyyy/mm/dd
      const dtparts = parts[0].split('/');
      if (dtparts.length === 3) {
        if (dtparts[0].length === 4) {
          // Dateformat: yyyy/mm/dd
          result.date =
            dtparts[0] + '-' + ('0' + dtparts[1]).substr(-2) + '-' + ('0' + dtparts[2]).substr(-2);
        } else if (dtparts[2].length === 2) {
          if (dateFormat.indexOf('/d/') > -1 || dateFormat.indexOf('/dd/') > -1) {
            // Dateformat: mm/dd/yy
            result.date =
              '20' +
              dtparts[2] +
              '-' +
              ('0' + dtparts[1]).substr(-2) +
              '-' +
              ('0' + dtparts[0]).substr(-2);
          } else {
            // Dateformat: dd/mm/yy
            result.date =
              '20' +
              dtparts[2] +
              '-' +
              ('0' + dtparts[1]).substr(-2) +
              '-' +
              ('0' + dtparts[0]).substr(-2);
          }
        } else {
          // Dateformat: mm/dd/yyyy or dd/mm/yyyy
          const isEN =
            dt.toLowerCase().indexOf('pm') > -1 ||
            dt.toLowerCase().indexOf('p.m.') > -1 ||
            dt.toLowerCase().indexOf('p. m.') > -1 ||
            dt.toLowerCase().indexOf('am') > -1 ||
            dt.toLowerCase().indexOf('a.m.') > -1 ||
            dt.toLowerCase().indexOf('a. m.') > -1;
          if (
            (isEN || dateFormat.indexOf('/d/') > -1 || dateFormat.indexOf('/dd/') > -1) &&
            dateFormat.indexOf('dd/') !== 0
          ) {
            // Dateformat: mm/dd/yyyy
            result.date =
              dtparts[2] +
              '-' +
              ('0' + dtparts[0]).substr(-2) +
              '-' +
              ('0' + dtparts[1]).substr(-2);
          } else {
            // Dateformat: dd/mm/yyyy
            result.date =
              dtparts[2] +
              '-' +
              ('0' + dtparts[1]).substr(-2) +
              '-' +
              ('0' + dtparts[0]).substr(-2);
          }
        }
      }
    }
    if (parts[0].indexOf('.') >= 0) {
      const dtparts = parts[0].split('.');
      if (dtparts.length === 3) {
        if (dateFormat.indexOf('.d.') > -1 || dateFormat.indexOf('.dd.') > -1) {
          // Dateformat: mm.dd.yyyy
          result.date =
            dtparts[2] + '-' + ('0' + dtparts[0]).substr(-2) + '-' + ('0' + dtparts[1]).substr(-2);
        } else {
          // Dateformat: dd.mm.yyyy
          result.date =
            dtparts[2] + '-' + ('0' + dtparts[1]).substr(-2) + '-' + ('0' + dtparts[0]).substr(-2);
        }
      }
    }
    if (parts[0].indexOf('-') >= 0) {
      // Dateformat: yyyy-mm-dd
      const dtparts = parts[0].split('-');
      if (dtparts.length === 3) {
        result.date =
          dtparts[0] + '-' + ('0' + dtparts[1]).substr(-2) + '-' + ('0' + dtparts[2]).substr(-2);
      }
    }
  }
  if (parts[1]) {
    parts.shift();
    const time = parts.join(' ');
    result.time = parseTime(time, pmDesignator);
  }
  return result;
}
