# @ishiduca/snoopy-compose

compose multiple small apps into one.

## exmaple

```js:app.js
const yo = require('yo-yo')
const { start } = require('@ishiduca/snoopy')
const compose = require('@ishiduca/snoopy-compose')
const appError = require('./apps/error')
const appResult = require('./apps/result')
const appForm = require('./apps/form')

const app = compose({
  appForm, appResult, appError
}, function template (views) {
  return yo`
    <div>
      <div>${views.appForm}</div>
      <div>${views.appResult}</div>
      <div class="modal">${views.appError}</div>
    </div>
  `
})

const { views } = start(app)
const root = document.createElement('div')
views().on('data', rt => yo.update(root, rt))

document.body.appendChild(root)
```

```js:appForm
module.exports = {
  init () { return { model: '' } },
  update (model, action) {
    if (action && acion.oninput != null) {
      return {
        model: action.oninput,
        effect: action
      }
    }
    return { model}
  },
  view (model, actionsUp) {
    return yo`
      <div>
        <input
          type="text"
          size=30
          required
          value=${model}
          oninput=${e => actionsUp({ oninput: e.target.value })
          />
      </div>
    `
  },
  run (effect, sources) {
    if (effect && effect.oninput != null) {
      return api.toUpperCase(effect.oninput)
    }
  }
}
```

```js:api
const { through } = require('mississippi')
const BEYOND = require('@ishiduca/snoopy-compose/beyond')
const bey = (action) => ({ [BEYOND]: action })

module.exports = {
  toUpperCase (value) {
    const toUpperCaseResult = value.split(' ').filter(Boolean)
      .map(str => (str.slice(0, 1) + str.slice(1)))
      .join(' ')
    const src = through.obj()
    if (str.length) {
      src.end(bey({ toUpperCaseResult }))
    } else {
      src.end(bey({ error: new Error('no valid value found.') }))
    }
    return src
  },
  removeError () {
    const src = through.obj()
    process.nextTick(() => src.end(bey({ removeError: true })))
    return src
  }
}
```

```js:appResult
module.exports = {
  init () { return { model: '' } },
  update (model, action) {
    if (action && action.toUpperCaseResult != null) {
      return {
        model: action.toUpperCaseResult,
        effect: { removeError: true }
      }
    }
    return { model }
  },
  view (model, actionsUp) {
    return yo`
      <p><b>${model}</b></p>
    `
  },
  run (effect) {
    if (effect && effect.removeError) {
      return api.removeError()
    }
  }
}
```

```js:appError
module.exports = {
  init () { return { model: null } },
  update (model, action) {
    if (action && action.error) {
      return {
        model: {
          name: action.error.name,
          message: action.error.message
        }
      }
    }
    if (action && action.removeError) {
      return { model: null }
    }
    return { model }
  },
  view (model, actionsUp) {
    if (model == null) return ''
    return yo`
      <div
        onclick=${e => actionsUp({ removeError: true })}
      >
        <h1>${model.name}</h1>
        <p>${model.message}</p>
      </div>
    `
  }
}
```

Each "small" app knows only about itself. Therefore, the "state" handled by each app is small and simple.
On the other hand, dealing with apps other than yourself requires a rather complicated procedure.

### use BEYOND action

```js
const BEYOND = require('@ishiduca/snoopy-compose/beyond')
const actBeyond = (action) => ({ [BEYOND]: action })

app.run = (effect, sources) => {
  const src = through.obj()
  src.end(actBeyond({ error: new Error('hoge' }))
  return src
}
```

