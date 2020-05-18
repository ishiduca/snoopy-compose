module.exports = {
  init () { return { model: 100 } },
  update (model, action) {
    if (action == null) return { model }
    if (action === 'dec') {
      return { model: model - 1 }
    }
    return { model }
  },
  view (model, actionsUp) {
    actionsUp('dec')
    return model
  },
  run (effect, sources) {}
}
