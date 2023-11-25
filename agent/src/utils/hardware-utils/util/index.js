/**
 * @Author: 王澍（SunilWang）
 * @Date: 2020-06-18 17:11:25
 * @Last Modified by: 王澍（SunilWang）
 * @Last Modified time: 2020-06-18 17:11:47
 * @Description:
 */
exports.isNumber = function(num) {
  return num !== true && num !== false && Boolean(num === 0 || (num && !isNaN(num)));
};

require('util')
