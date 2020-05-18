var yo = require('yo-yo')

module.exports = {
  init () {
    return { model: null }
  },
  update (model, action) {
    if (action == null) return { model }
    if (action.error != null) {
      return { model: action.error }
    }
    if (action.removeError != null) {
      return { model: null }
    }
    return { model }
  },
  view (model, actionsUp) {
    if (model == null) return yo`<div></div>`
    return yo`
      <div>
        <div onclick=${e => actionsUp({ removeError: true })}>
          <h1>${model.name}</h1>
          <p>${model.message}</p>
        </div>
      </div>
    `
  }
}
