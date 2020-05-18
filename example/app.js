var yo = require('yo-yo')
var inputApp = require('./input')
var resultApp = require('./result')
var errorApp = require('./error')
var compose = require('../compose')

module.exports = compose({
  inputApp,
  resultApp,
  errorApp
}, template)

function template (views) {
  return yo`
    <div>
      <header>
        <h1>compose app example</h1>
        <p>sum app</p>
      </header>
      ${views.inputApp}
      ${views.resultApp}
      ${views.errorApp}
    </div>
  `
}
