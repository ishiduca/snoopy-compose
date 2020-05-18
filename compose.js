var xtend = require('xtend')
var { through } = require('mississippi')
var multi = require('@ishiduca/snoopy-multi')
var defaultLayoutApp = require('./layout')
var BEYOND = require('./beyond')

module.exports = function compseApp (_apps, _layoutApp) {
  var layoutApp
  if (_layoutApp == null) {
    layoutApp = defaultLayoutApp
  } else if (typeof _layoutApp === 'function') {
    layoutApp = xtend(defaultLayoutApp, { template: _layoutApp, layout: null })
  } else if (_layoutApp && (_layoutApp.template || _layoutApp.layout)) {
    layoutApp = _layoutApp
  }

  if (!layoutApp) {
    var error = new Error('"layoutApp" not found')
    error.data = { _layoutApp }
    throw error
  }

  var appNames = Object.keys(_apps)
  var apps = appNames.reduce(
    (apps, appName) => xtend(apps, { [appName]: multi(_apps[appName]) }),
    {}
  )

  function init () {
    var state = composeState(appName => apps[appName].init())
    var layoutAppState = layoutApp.init()
    var model = composeModel(state.model, layoutAppState.model, 'layoutApp')
    var effect = composeEffect(state.effect, layoutAppState.effect, 'layoutApp')
    return effect != null ? { model, effect } : { model }
  }

  function splat (_model, action) {
    if (action == null) return { model: _model }
    var state = composeState((appName) => (
      apps[appName].update && apps[appName].update._splat
        ? apps[appName].update._splat(_model[appName], action)
        : apps[appName].update(_model[appName], action)
    ))
    var layoutAppState = layoutApp.update(_model.layoutApp, action.layoutApp)
    var model = composeModel(state.model, layoutAppState.model, 'layoutApp')
    var effect = composeEffect(state.effect, layoutAppState.effect, 'layoutApp')
    return effect != null ? { model, effect } : { model }
  }

  function update (_model, action) {
    if (action == null) return { model: _model }
    if (action[BEYOND] != null) return splat(_model, action[BEYOND])

    var state = composeState(appName => (
      apps[appName].update(_model[appName], action[appName])
    ))
    var layoutAppState = layoutApp.update(_model.layoutApp, action.layoutApp)
    var model = composeModel(state.model, layoutAppState.model, 'layoutApp')
    var effect = composeEffect(state.effect, layoutAppState.effect, 'layoutApp')
    return effect != null ? { model, effect } : { model }
  }

  update._splat = splat

  function view (model, actionsUp) {
    if (layoutApp.layout) return layoutApp.layout(apps, model, actionsUp)

    return layoutApp.template(
      appNames.reduce((views, appName) => xtend(
        views,
        { [appName]: apps[appName].view(model[appName], action => (
          actionsUp({ [appName]: action })
        )) }
      ), {}),
      model
    )
  }

  function run (effect, sources) {
    if (effect == null) return

    var _actionsSrcLayoutApp = (
      effect.layoutApp != null && layoutApp.run != null &&
        layoutApp.run(effect.layoutApp, sources)
    )
    var actionsSrcLayoutApp = (
      _actionsSrcLayoutApp
        ? _actionsSrcLayoutApp.pipe(transf('layout'))
        : null
    )
    var actionsSrcs = appNames.map(appName => {
      if (effect[appName] == null) return
      if (!apps[appName] || !apps[appName].run) return
      var actionsSrc = apps[appName].run(effect[appName], sources)
      return (
        actionsSrc != null && actionsSrc.pipe(transf(appName))
      )
    }).concat(actionsSrcLayoutApp).filter(Boolean)

    if (actionsSrcs.length === 0) return
    if (actionsSrcs.length === 1) return actionsSrcs[0]

    var i = 0
    var actionsSrc = through.obj()
    actionsSrc.on('pipe', src => (i += 1))
    actionsSrc.on('unpipe', src => ((i -= 1) || actionsSrc.end()))
    actionsSrcs.forEach(s => s.pipe(actionsSrc, { end: false }))

    return actionsSrc

    function transf (appName) {
      return through.obj((action, _, done) => {
        action && action[BEYOND] != null
          ? done(null, action)
          : done(null, { [appName]: action })
      })
    }
  }

  return multi({ init, update, view, run })

  function composeState (f) {
    return appNames.reduce((states, appName) => {
      var state = f(appName)
      var model = composeModel(states.model, state.model, appName)
      var effect = composeEffect(states.effect, state.effect, appName)
      return effect != null ? { model, effect } : { model }
    }, {})
  }

  function composeModel (model, mdl, appName) {
    return xtend(model, { [appName]: mdl })
  }

  function composeEffect (effect, ef, appName) {
    return (
      effect != null
        ? ef != null ? xtend(effect, { [appName]: ef }) : effect
        : ef != null ? { [appName]: ef } : null
    )
  }
}
