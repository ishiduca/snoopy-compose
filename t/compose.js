'use strict'
const test = require('tape')
const {start, through, pipe} = require('@ishiduca/snoopy')
const compose = require('../compose')

test('composeしたAppでmodelがviewに伝わるか', t => {
  t.plan(1)
  const initialModel = {initial: true}
  const app = {
    init () { return {model: initialModel} },
    update (model, action) {
      t.fail()
    },
    view (model) {
      t.is(model, initialModel)
    },
    run (effect) {}
  }

  start(compose([app], () => (null)))
})

test('composeしたAppでactionがupdateに伝わるか', t => {
  t.plan(1)
  const initialModel = {initial: true}
  const expectedAction = {click: true}
  let onclick
  const app = {
    init () { return {model: initialModel} },
    update (model, action) {
      t.is(action, expectedAction)
    },
    view (model, actionsUp) {
      onclick || actionsUp(expectedAction)
      onclick = true
    },
    run (effect) {}
  }

  start(compose([app], () => (null)))
})

test('composeしたAppでviewで返した結果を template function が拾えるか', t => {
  t.plan(1)
  const initialModel = {initial: true}
  const app = {
    init () { return {model: initialModel} },
    update (model, action) {
      t.fail()
    },
    view (model) { return model },
    run (effect) {}
  }

  start(compose([app], views => {
    t.deepEqual(views, [initialModel])
  }))
})

test('composeしたAppでviewでtemplate function が返した結果をviews streamで送れるか', t => {
  t.plan(1)
  const initialModel = {initial: true}
  const app = {
    init () { return {model: initialModel} },
    update (model, action) {
      t.fail()
    },
    view (model) { return model },
    run (effect) {}
  }

  const {views} = start(compose([app], views => (views)))
  pipe(
    views(),
    through.obj((views, _, done) => {
      t.deepEqual(views, [initialModel])
      done()
    }),
    err => console.error(err || 'noge')
  )
})

test('composeしたAppでeffectがrunに伝わるか', t => {
  t.plan(1)
  const initialModel = {initial: true}
  const initialEffect = 'INITIALIZE'
  const app = {
    init () { return {model: initialModel, effect: initialEffect} },
    update (model, action) {
      t.fail()
    },
    view (model, actionsUp) {},
    run (effect) {
      t.is(effect, initialEffect)
    }
  }
  start(compose([app], () => (null)))
})

test('composeしたAppでrunが発行したactionがupdateに伝わるか', t => {
  t.plan(1)
  const initialModel = {initial: true}
  const initialEffect = 'INITIALIZE'
  const app = {
    init () { return {model: initialModel, effect: initialEffect} },
    update (model, action) {
      t.is(action, initialEffect)
    },
    view (model, actionsUp) {},
    run (effect) {
      const actionsSource = through.obj()
      actionsSource.end(effect)
      return actionsSource
    }
  }
  start(compose([app], () => (null)))
})

test('混ざらずにmodelをviewに伝えられるか', t => {
  t.plan(2)
  const app1 = {
    init () { return {model: 1} },
    update () {},
    view (model, actionsUp) {
      t.is(model, 1)
    },
    run () {}
  }
  const app2 = {
    init () { return {model: 2} },
    update () {},
    view (model, actionsUp) {
      t.is(model, 2)
    }
  }
  start(compose([app1, app2], () => null))
})

test('混ざらずにactionをupdateに伝えられるか', t => {
  t.plan(2)
  let flg
  const app1 = {
    init () { return {model: 1} },
    update (model, action) {
      t.is(model, 1)
      t.is(action, -1)
    },
    view (model, actionsUp) {
      flg || actionsUp(-1)
      flg = true
    },
    run () {}
  }
  const app2 = {
    init () { return {model: 2} },
    update (model, action) {
      t.fail()
    },
    view (model, actionsUp) {},
    run () {}
  }
  start(compose([app1, app2], () => null))
})

test('runで発行したactionはAppを越えて、updateに伝えられるか', t => {
  t.plan(2)
  const expectedAction = {INITIALIZE: true}
  const app1 = {
    init () { return {model: null, effect: expectedAction} },
    update (model, action) {
      t.is(action, expectedAction)
      return {model}
    },
    view () {},
    run (effect, sources) {
      const actionsSource = through.obj()
      actionsSource.end(effect)
      return actionsSource
    }
  }
  const app2 = {
    init () { return {model: null} },
    update (model, action) {
      t.is(action, expectedAction)
      return {model}
    },
    view () {},
    run (effect, sources) {
      t.fail()
    }
  }
  start(compose([app1, app2], () => null))
})
