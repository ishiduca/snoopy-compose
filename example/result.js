var yo = require('yo-yo')
var { removeError } = require('./api')

module.exports = {
  init () {
    return { model: 0 }
  },
  update (model, action) {
    if (action && action.sum != null) {
      return {
        model: action.sum,
        effect: { removeError: true }
      }
    }
    return { model }
  },
  view (model, actionsUp) {
    return yo`
      <div>
        <p>result: <b>${model}</b></p>
      </div>
    `
  },
  run (effect) {
    if (effect && effect.removeError != null) {
      return removeError()
    }
  }
}
