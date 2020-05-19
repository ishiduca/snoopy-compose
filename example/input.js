var yo = require('yo-yo')
var { sum } = require('./api')

function parse (str) {
  return str.split(' ').filter(Boolean).map(Number)
}

module.exports = {
  init () {
    return { model: '' }
  },
  update (model, action) {
    if (action && action.oninput != null) {
      return {
        model: action.oninput,
        effect: { oninput: parse(action.oninput) }
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
