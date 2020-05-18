var test = require('tape')
var compose = require('compose')
var appA = require('./apps/appA')
var appB = require('./apps/appB')
var appC = require('./apps/appC')

test('var composedApp = compose({ apps }, layoutApp)', t => {
  t.test('initState: { model, effect } = compose.init()', t => {
    t.test('app = compose({ appA, appB })', t => {
      var app = compose({ appA, appB })
      var state = app.init()
      var expected = {
        model: { appA: 0, appB: 100, layoutApp: null },
        effect: { appA: { init: true } }
      }
      t.deepEqual(state, expected, JSON.stringify(state))
      t.end()
    })
    t.test('app = compose({ appA, appB: compose({ _app: appB }) })', t => {
      var app = compose({ appA, appB: compose({ _app: appB }) })
      var state = app.init()
      var expected = {
        model: { appA: 0, appB: { _app: 100, layoutApp: null }, layoutApp: null },
        effect: { appA: { init: true } }
      }
      t.deepEqual(state, expected, JSON.stringify(state))
      t.end()
    })
    t.test('app = compose({ appA, appB: compose({ _app: appB, appC }) })', t => {
      var app = compose({ appA, appB: compose({ _app: appB, appC }) })
      var state = app.init()
      var expected = {
        model: { appA: 0, appB: { _app: 100, appC: 1, layoutApp: null }, layoutApp: null },
        effect: { appA: { init: true }, appB: { appC: { init: true } } }
      }
      t.deepEqual(state, expected, JSON.stringify(state))
      t.end()
    })
    t.end()
  })
  t.end()
})
