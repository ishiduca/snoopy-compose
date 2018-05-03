var missi = require('mississippi')
var defined = require('defined')

module.exports = compose

function compose (apps, template) {
  return {
    init: function () {
      return composeState(
        apps.map(function (app) {
          return defined(app.init(), {model: null})
        })
      )
    },
    update: function (models, actions) {
      return composeState(
        apps.map(function (app, i) {
          return typeof actions[i] === 'undefined'
            ? {model: models[i]}
            : defined(app.update(models[i], actions[i]), {model: models[i]})
        })
      )
    },
    view: function (models, actionsUp) {
      var aup = function (i) {
        return function (action) {
          return actionsUp(item(action, i))
        }
      }
      return template(
        apps.map(function (app, i) {
          return app.view(models[i], aup(i))
        })
      )
    },
    run: function (effects, sources) {
      if (effects == null) return
      var many = missi.through.obj()
      var actionsSources = []
      apps.forEach(function (app, i) {
        var actionsSource
        if (effects[i] == null) return
        if ((actionsSource = app.run(effects[i], sources)) == null) return
        actionsSources.push(actionsSource)
        missi.pipe(
          actionsSource,
          missi.through.obj(function (action, _, done) {
            many.write(apps.map(function (x) { return action }))
            done()
          }),
          function (err) {
            if (err) {
              sources.errors().write(err)
            }

            actionsSources = actionsSources.filter(function (as) {
              return as !== actionsSource
            })
            if (actionsSources.length === 0) {
              many.end()
            }
          }
        )
      })
      return many
    }
  }
}

function item (data, i) {
  var arry = []
  arry[i] = data
  return arry
}

function composeState (states) {
  return {
    model: states.map(function (state) { return state.model }),
    effect: states.some(function (state) { return state.effect != null })
      ? states.map(function (state) { return state.effect || null })
      : null
  }
}
