var yo = require('yo-yo')
module.exports = function (views) {
  return yo`
    <div>${Object.keys(views).map(name => yo`<div>${views[name]}</div>`)}</div>
  `
}
