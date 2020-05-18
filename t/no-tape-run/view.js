var test = require('tape')
var compose = require('compose')
var appA = require('../apps/appA')
var appB = require('../apps/appB')
var template = require('template')

test('htmlElement = composeApp.view(model, actionsUp)', t => {
  t.test('use default layaoutApp', t => {
    t.test('compose({ appA, appB })', t => {
      var app = compose({ appA, appB })
      var state = app.init()
      var spy = []
      var v = app.view(state.model, spy.push.bind(spy))
      var str = String(v).replace(/\s/g, '').replace(/\n/g, '')
      var expectedStr = '<div>0100</div>'
      var expectedSpy = [ { appB: 'dec' } ]
      t.is(str, expectedStr, str)
      t.deepEqual(spy, expectedSpy, 'action = { appB: "dec" }')
      t.end()
    })

    t.test('compose({ appA, appB: compose({ _app: appB }) })', t => {
      var app = compose({ appA, appB: compose({ _app: appB }) })
      var state = app.init()
      var spy = []
      var v = app.view(state.model, spy.push.bind(spy))
      var str = String(v).replace(/\s/g, '').replace(/\n/g, '')
      var expectedStr = '<div>0<div>100</div></div>'
      var expectedSpy = [ { appB: { _app: 'dec' } } ]
      t.is(str, expectedStr, str)
      t.deepEqual(spy, expectedSpy, 'action = { appB: { _app: "dec" } }')
      t.end()
    })
    t.end()
  })

  t.test('use templateFunction', t => {
    t.test('compose({ appA, appB , templateFunction})', t => {
      var app = compose({ appA, appB }, template)
      var state = app.init()
      var spy = []
      var v = app.view(state.model, spy.push.bind(spy))
      var str = String(v).replace(/\s/g, '').replace(/\n/g, '')
      var expectedStr = '<div><div>0</div><div>100</div></div>'
      var expectedSpy = [ { appB: 'dec' } ]
      t.is(str, expectedStr, str)
      t.deepEqual(spy, expectedSpy, 'action = { appB: "dec" }')
      t.end()
    })

    t.test('compose({ appA, appB: compose({ _app: appB }) }, templateFunction)', t => {
      var app = compose({ appA, appB: compose({ _app: appB }) }, template)
      var state = app.init()
      var spy = []
      var v = app.view(state.model, spy.push.bind(spy))
      var str = String(v).replace(/\s/g, '').replace(/\n/g, '')
      var expectedStr = '<div><div>0</div><div><div>100</div></div></div>'
      var expectedSpy = [ { appB: { _app: 'dec' } } ]
      t.is(str, expectedStr, str)
      t.deepEqual(spy, expectedSpy, 'action = { appB: { _app: "dec" } }')
      t.end()
    })

    t.test('compose({ appA, appB: compose({ _app: appB }, templateFunction) })', t => {
      var app = compose({ appA, appB: compose({ _app: appB }, template) })
      var state = app.init()
      var spy = []
      var v = app.view(state.model, spy.push.bind(spy))
      var str = String(v).replace(/\s/g, '').replace(/\n/g, '')
      var expectedStr = '<div>0<div><div>100</div></div></div>'
      var expectedSpy = [ { appB: { _app: 'dec' } } ]
      t.is(str, expectedStr, str)
      t.deepEqual(spy, expectedSpy, 'action = { appB: { _app: "dec" } }')
      t.end()
    })
    t.end()
  })
  t.end()
})
