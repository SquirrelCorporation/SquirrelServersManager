
module.exports = {
  options: {
    NOT_SUPPORTED_VALUE: 'not supported',
    INTERVAL: 1000
  },
  isNotSupported(res){
    return res === this.options.NOT_SUPPORTED_VALUE
  }
}
