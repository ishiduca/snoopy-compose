var yo = require('yo-yo')
var { sum } = require('./api')

module.exports = {
  init () {
    return { model: '' }
  },
  update (model, action) {
    if (action == null) return { model }
    if (action.oninput != null) {
      return {
        model: action.oninput,
        effect: action
      }
    }
    return { model }
  },
  view (model, actionsUp) {
    return yo`
      <div>
        <input
          type="text"
          size=30
          required
          value=${model}
          oninput=${e => actionsUp({ oninput: e.target.value })}
        />
      </div>
    `
  },
  run (effect) {
    if (effect && effect.oninput != null) {
      return sum(effect.oninput)
    }
  }
}
