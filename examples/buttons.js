const yo = require('yo-yo')
const xtend = require('xtend')
const {start, pipe, through} = require('@ishiduca/snoopy')
const compose = require('../compose')

const creator = type => value => ({type, value})

const updateHelper = mapper => (model, action) => (
  mapper[action.type] != null
    ? mapper[action.type](model, action.value)
    : {model}
)

const runHelper = mapper => (effect, sources) => (
  mapper[effect.type] != null
    ? mapper[effect.type](effect.value, sources)
    : null
)

const inc = creator('inc')
const dec = creator('dec')
const beyondInc = creator('beyondInc')
const BEYOND_INC = creator('BEYOND_INC')

const main = yo`<div></div>`
const app = {
  update: updateHelper({
    inc (model, action) { return {model: model + 1} },
    dec (model, action) { return {model: model - 1} },
    beyondInc (model, action) { return {model, effect: BEYOND_INC()} }
  }),
  view (model, actionsUp) {
    return yo`
      <div>
        <p>${model}</p>
        <div>
          <button onclick=${e => actionsUp(inc())}>inc</button>
          <button onclick=${e => actionsUp(dec())}>dec</button>
          <button onclick=${e => actionsUp(beyondInc())}>beyond inc</button>
        </div>
      </div>
    `
  },
  run: runHelper({
    BEYOND_INC (effect, sources) {
      const s = through.obj()
      s.end(inc())
      return s
    }
  })
}

const template = views => yo`
  <div>
    ${views.map((view, i) => yo`
      <section class=${`app-${i}`}>
        ${view}
      </section>
    `)}
  </div>
`

const {views, models} = start(
  compose([
    xtend(app, {init () { return {model: 0} }}),
    xtend(app, {init () { return {model: 10} }}),
    xtend(app, {init () { return {model: 100} }})
  ], template)
)

pipe(
  models(),
  through.obj((model, _, done) => {
    console.log(model)
    done()
  }),
  err => console.log(err || 'app finish')
)

pipe(
  views(),
  through.obj((el, _, done) => {
    yo.update(main, el)
    done()
  }),
  err => console.log(err || 'app finished')
)

document.body.appendChild(main)
