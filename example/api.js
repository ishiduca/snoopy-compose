var { through } = require('mississippi')
var BEYOND = require('../beyond')
var be = action => ({ [BEYOND]: action })

module.exports = {
  sum (params) {
    var src = through.obj()
    sum(params, (error, sum) => {
      process.nextTick(() => {
        error != null ? src.end(be({ error })) : src.end(be({ sum }))
      })
    })
    return src
  },
  removeError () {
    var src = through.obj()
    process.nextTick(() => src.end(be({ removeError: true })))
    return src
  }
}

function sum (params, done) {
  var values = params.split(/\s/g)
    .filter(Boolean)
    .map(Number)
  if (!values.length) return done(null, 0)
  if (values.some(n => isNaN(n))) {
    return done(new TypeError('contains a non-enumeric value'))
  }
  done(null, values.reduce((a, b) => (a + b), 0))
}
