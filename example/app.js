var yo = require('yo-yo')
var inputApp = require('./input')
var resultApp = require('./result')
var errorApp = require('./error')
var compose = require('../compose')

var ResultApp = compose({
  resultApp, errorApp
}, ({ resultApp, errorApp }) => yo`
  <div>
    ${resultApp}
    ${errorApp}
  </div>
`)

module.exports = compose({
  inputApp, ResultApp
}, ({ inputApp, ResultApp }) => yo`
  <div>
    <header>
      <h1>compose app example</h1>
      <p>sum app</p>
    </header>
    <div role="application">
      ${inputApp}
      ${ResultApp}
    </div>
  </div>
`)
