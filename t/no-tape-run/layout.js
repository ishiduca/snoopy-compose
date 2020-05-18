var test = require('tape')
var yo = require('yo-yo')
var layoutApp = require('layout')

test('layoutApp', t => {
  var appA = {
    init () { return { model: 1 } },
    update (model, action) {
      if (action == null) return { model }
      if (action != null) return { model: model + 1 }
      return { model }
    },
    view (model, actionsUp) {
      actionsUp(true)
      return yo`
        <div>
         <p>${model}</p>
         <button onclick=${e => actionsUp(true)}>inc</button>
        </div>
      `
    }
  }
  var appB = {
    init () { return { model: 99 } },
    update (model, action) {
      if (action == null) return { model }
      if (action != null) return { model: model - 1 }
      return { model }
    },
    view (model, actionsUp) {
      actionsUp(true)
      return yo`
        <div>
         <p>${model}</p>
         <button onclick=${e => actionsUp(true)}>dec</button>
        </div>
      `
    }
  }
  var apps = { appA, appB }
  var model = { appA: appA.init().model, appB: appB.init().model }
  var spy = []
  var view = layoutApp.layout(apps, model, spy.push.bind(spy))

  t.test('htmlElement = layoutApp.layout(apps, model, actionsUp)', t => {
    var viewStr = String(view).replace(/\s{2,}/g, '').replace(/\n/g, '')
    var expected = '<div><div><p>1</p><button>inc</button></div><div><p>99</p><button>dec</button></div></div>'
    t.is(viewStr, expected, viewStr)
    t.end()
  })

  t.test('actionsUp', t => {
    t.deepEqual(spy, [ { appA: true }, { appB: true } ], JSON.stringify(spy))
    t.end()
  })
  t.end()
})
