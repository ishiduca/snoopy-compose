var defined = require('defined')
var snoop = require('@ishiduca/snoopy')

module.exports = compose

function compose (apps, template) {
  return {
    init: function () {
      return composeState(
        apps.map(function (app) {
          return defined(
            defined(app.init, snoop.defaults.init).call(app),
            {model: null}
          )
        })
      )
    },
    update: function (models, actions) {
      return composeState(
        apps.map(function (app, i) {
          return typeof actions[i] === 'undefined'
            ? {model: models[i]}
            : defined(
              defined(app.update, snoop.defaults.update).call(app, models[i], actions[i]),
              {model: models[i]}
            )
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
          return defined(app.view, snoop.defaults.view).call(app, models[i], aup(i))
        })
      )
    },
    run: function (effects, sources) {
      if (effects == null) return
      var many = snoop.through.obj()
      var actionsSources = []
      apps.forEach(function (app, i) {
        var actionsSource
        var run = defined(app.run, snoop.defaults.run)
        if (effects[i] == null) return
        if ((actionsSource = run.call(app, effects[i], sources)) == null) return
        actionsSources.push(actionsSource)
        snoop.pipe(
          actionsSource,
          snoop.through.obj(function (action, _, done) {
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
