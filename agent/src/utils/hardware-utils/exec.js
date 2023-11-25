var cp = require('child_process')
var bucket = require('./bucket')

function exec(command){
  return new Promise(function (resolve) {
    var runCommand = 'LC_ALL="en_US.UTF-8";LANG="en_US.UTF-8";LANGUAGE="en_US:en";' + command

    cp.exec(runCommand, { shell: true }, function (err, stdout, stderr) {
      if (err || !stdout) {
        return resolve(bucket.options.NOT_SUPPORTED_VALUE)
      }

      return resolve(stdout)
    })
  })
}

module.exports = exec
module.exports.wrapExec = function(command){
  return function(){
    return exec(command)
  }
}

