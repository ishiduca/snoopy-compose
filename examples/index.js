const yo = require('yo-yo')
const css = require('sheetify')
const {start, pipe, through} = require('@ishiduca/snoopy')
const compose = require('../compose')
const main = yo`<div></div>`

const template = views => yo`
  <div class="container">
    <div class="level">
      <section class="level-left">
        <div class="level-item">
          ${views[0]}
        </div>
      </section>
      <section class="level-right">
        <div class="level-item">${views[1]}</div>
      </section>
    </div>
  </div>
`

const {views, models, actions} = start(
  compose([
    require('./products'),
    require('./cart')
  ], template)
)

const onEnd = err => err ? console.error(err) : console.log('app finished!')

pipe(
  actions(),
  through.obj((action, _, done) => {
    console.dir({actions: action})
    done()
  }),
  onEnd
)

pipe(
  models(),
  through.obj((model, _, done) => {
    console.dir({models: model})
    done()
  }),
  onEnd
)

pipe(
  views(),
  through.obj((el, _, done) => {
    yo.update(main, el)
    done()
  }),
  onEnd
)

css('./css/bulma.css')
document.body.appendChild(main)
