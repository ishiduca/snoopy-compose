module.exports = {
  init () { return { model: 0, effect: { init: true } } },
  update (model, action) {
    if (action == null) return { model }
    if (action === 'inc') {
      return { model: model + 1 }
    }
    return { model }
  },
  view (model, actionsUp) { return model },
  run (effect, sources) {}
}
