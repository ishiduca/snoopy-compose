module.exports = {
  init () { return { model: 1, effect: { init: true } } },
  update (model, action) {
    if (action == null) return { model }
    if (action === 'inc') {
      return { model: model + 10 }
    }
    return { model }
  },
  view (model, actionsUp) { return model },
  run (effect, sources) {}
}
