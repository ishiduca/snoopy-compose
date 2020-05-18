var yo = require('yo-yo')
module.exports = {
  init () { return { model: null } },
  update (model, action) { return { model } },
  run (effect, sources) {},
  layout (apps, model, actionsUp) {
    return yo`
      <div>
  ${Object.keys(apps).map(appName => (
    apps[appName].view(model[appName], action => (
      actionsUp({ [appName]: action })
    ))
  ))}
      </div>
    `
  }
}
