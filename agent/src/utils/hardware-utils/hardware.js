import os from "os";

const bucket = require('./bucket');

bucket.hardware = {
  CPUModel: function () {
    var platform = os.platform()

    if (platform === 'linux') {
      var self = this

      return co(function * (){
        var res = yield exec('cat /proc/cpuinfo')

        if(bucket.isNotSupported(res)) throw new TypeError('Platform not supported for CPU Model!')

        var model = res.match(/[\n\r].*Model:\s*([^\n\r]*)/)[1]
        if (model) {
          return model;
        }
        var modelName = res.match(/.*model name:\s*([^\n\r]*)/)[1]

        return modelName
      })
    }

    if (platform === 'darwin') {
      throw new TypeError('Platform not supported for CPU Model!')
    }

  },
}
