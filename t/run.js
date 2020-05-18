var test = require('tape')
var xtend = require('xtend')
var { concat, through, pipe } = require('mississippi')
var compose = require('compose')
var BEYOND = require('beyond')
var _appA = require('./apps/appA')
var _appB = require('./apps/appB')
var _appC = require('./apps/appC')
function be (action) { return { [BEYOND]: action } }

test('effectActionsSources = app.run(effect, sources)', t => {
  var run = (e, s) => {
    var src
    if (e.init) {
      src = through.obj()
      process.nextTick(() => src.end(e))
      return src
    }
  }
  var xb = {
    init () {
      var state = _appB.init()
      var effect = { preBEYOND: true }
      return xtend(state, { effect })
    },
    run (e, s) {
      var src
      if (e.preBEYOND) {
        src = through.obj()
        process.nextTick(() => src.end(be({ init: true })))
        return src
      }
    }
  }
  var appA = xtend(_appA, { run })
  var appB = xtend(_appB, xb)
  var appC = xtend(_appC, { run })
  t.test('compose({ appA, appB, appC })', t => {
    var expected = [
      { appA: { init: true } },
      { [BEYOND]: { init: true } },
      { appC: { init: true } }
    ]
    var app = compose({ appA, appB, appC })
    pipe(
      app.run(app.init().effect),
      concat(actions => {
        t.deepEqual(actions, expected)
      }),
      error => {
        t.error(error)
        t.end()
      }
    )
  })
  t.test('compose({ appA, appB: compose({ _app: appB, appC: compose({ _app: appC }) }) })', t => {
    var expected = [
      { appA: { init: true } },
      { [BEYOND]: { init: true } },
      { appB: { appC: { _app: { init: true } } } }
    ]
    var app = compose({ appA, appB: compose({ _app: appB, appC: compose({ _app: appC }) }) })
    pipe(
      app.run(app.init().effect),
      concat(actions => {
        t.deepEqual(actions, expected)
      }),
      error => {
        t.error(error)
        t.end()
      }
    )
  })

  t.test('multi effect', t => {
    var expected = [
      { appA: { init: true } },
      { [BEYOND]: { init: true } }
    ]
    var effect = [
      { appA: { init: true } },
      { appB: { preBEYOND: true } }
    ]
    var app = compose({ appA, appB, appC })
    pipe(
      app.run(effect),
      concat(actions => {
        t.deepEqual(actions, expected)
      }),
      error => {
        t.error(error)
        t.end()
      }
    )
  })

  t.end()
})
