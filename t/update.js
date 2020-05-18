var test = require('tape')
var compose = require('compose')
var BEYOND = require('beyond')
var appA = require('./apps/appA')
var appB = require('./apps/appB')
var appC = require('./apps/appC')

function be (action) { return { [BEYOND]: action } }

test('', t => {
  t.test('updatedState: { model, effect } = app.update(model, action)', t => {
    t.test('app = compose({ appA, appB, appC })', t => {
      var app = compose({ appA, appB, appC })
      var expected = {
        model: { appA: 0, appB: 99, appC: 1, layoutApp: null }
      }
      var expectedAction = { appB: 'dec' }
      var initState = app.init()
      app.view(initState.model, action => {
        t.deepEqual(action, expectedAction)
        var updatedState = app.update(initState.model, action)
        t.deepEqual(updatedState, expected)
      })
      t.end()
    })

    t.test('app = compose({ appA, appB: compose({ app: appB, appC: compose({ app: appC }) }) })', t => {
      var app = compose({ appA, appB: compose({ _app: appB, appC: compose({ _app: appC }) }) })
      var expected = {
        model: {
          appA: 0,
          appB: {
            _app: 99,
            appC: {
              _app: 1,
              layoutApp: null
            },
            layoutApp: null
          },
          layoutApp: null
        }
      }
      var expectedAction = { appB: { _app: 'dec' } }
      var initState = app.init()
      app.view(initState.model, action => {
        t.deepEqual(action, expectedAction)
        var updatedState = app.update(initState.model, action)
        t.deepEqual(updatedState, expected)
      })
      t.end()
    })

    t.test('app = compose({ appA, appC: compose({ app: appC, appB: compose({ app: appB }) }) })', t => {
      var app = compose({ appA, appC: compose({ _app: appC, appB: compose({ _app: appB }) }) })
      var expected = {
        model: {
          appA: 0,
          appC: {
            _app: 1,
            appB: {
              _app: 99,
              layoutApp: null
            },
            layoutApp: null
          },
          layoutApp: null
        }
      }
      var expectedAction = { appC: { appB: { _app: 'dec' } } }
      var initState = app.init()
      app.view(initState.model, action => {
        t.deepEqual(action, expectedAction)
        var updatedState = app.update(initState.model, action)
        t.deepEqual(updatedState, expected)
      })
      t.end()
    })

    t.end()
  })

  t.test('beyond', t => {
    t.test('app = compose({ appA, appB, appC })', t => {
      var spy = []
      var actions = [
        be('dec'),
        be('inc')
      ]
      var expected = [
        { model: { appA: 0, appB: 99, appC: 1, layoutApp: null } },
        { model: { appA: 1, appB: 99, appC: 11, layoutApp: null } }
      ]
      var app = compose({ appA, appB, appC })
      actions.reduce((state, action) => {
        spy.push(app.update(state.model, action))
        return spy[spy.length - 1]
      }, app.init())
      t.deepEqual(spy, expected)
      t.end()
    })

    t.test('app = compose({ appA, appB: compose({ app: appB, appC: compose({ app: appC }) }) })', t => {
      var spy = []
      var actions = [
        be('inc'),
        be('dec')
      ]
      var expected = [
        { model: { appA: 1, appB: { _app: 100, appC: { _app: 11, layoutApp: null }, layoutApp: null }, layoutApp: null } },
        { model: { appA: 1, appB: { _app: 99, appC: { _app: 11, layoutApp: null }, layoutApp: null }, layoutApp: null } }
      ]
      var app = compose({ appA, appB: compose({ _app: appB, appC: compose({ _app: appC }) }) })
      actions.reduce((state, action) => {
        spy.push(app.update(state.model, action))
        return spy[spy.length - 1]
      }, app.init())
      t.deepEqual(spy, expected)
      t.end()
    })

    t.test('app = compose({ appA, appC: compose({ app: appC, appB: compose({ app: appB }) }) })', t => {
      var spy = []
      var actions = [
        be('dec'),
        be('inc')
      ]
      var expected = [
        { model: { appA: 0, appC: { _app: 1, appB: { _app: 99, layoutApp: null }, layoutApp: null }, layoutApp: null } },
        { model: { appA: 1, appC: { _app: 11, appB: { _app: 99, layoutApp: null }, layoutApp: null }, layoutApp: null } }
      ]
      var app = compose({ appA, appC: compose({ _app: appC, appB: compose({ _app: appB }) }) })
      actions.reduce((state, action) => {
        spy.push(app.update(state.model, action))
        return spy[spy.length - 1]
      }, app.init())
      t.deepEqual(spy, expected)
      t.end()
    })

    t.end()
  })

  t.end()
})
