const yo = require('yo-yo')
const xtend = require('xtend')
const {through} = require('@ishiduca/snoopy')
const {creator, updateHelper, runHelper} = require('./helpers')

const removeProductFromCart = creator('removeProductFromCart')
const preRemoveProductFromCart = creator('preRemoveProductFromCart')
const PRE_REMOVE_PRODUCT_FROM_CART = creator('PRE_REMOVE_PRODUCT_FROM_CART')

const app = {
  init () {
    return {
      model: {
        items: [],
        sum: 0
      }
    }
  },
  view (model, actionsUp) {
    return yo`
      <div>
        <header>
          <h2 class="title is-2">Cart</h2>
          <p>合計: ${model.sum}</p>
        </header>
        ${model.sum > 0 ? yo`
           <table class="table is-striped">
             <thead>
               <tr>
                 <th>product</th>
                 <th>price</th>
                 <th>set</th>
                 <th>sum</th>
                 <th>remove</th>
               </tr>
             </thead>
             <tbody>
               ${model.items.map(product => yo`
                 <tr>
                   <td>${product.name}</td>
                   <td>${product.price}</td>
                   <td>${product.set}</td>
                   <td>${product.set * product.price}</td>
                   <td>
                     <a class="button" onclick=${e => actionsUp(preRemoveProductFromCart(product))}>remove</a>
                   </td>
                 </tr>
               `)}
             </tbody>
           </table>
        ` : ''}
      </div>
    `
  },
  update: updateHelper({
    addProductToCart (model, product) {
      const items = model.items.some(p => p.id === product.id)
        ? model.items.map(p => p.id === product.id ? xtend(product, {stock: null, set: p.set + 1}) : p)
        : model.items.concat(xtend(product, {stock: null, set: 1}))
      const sum = items.map(p => p.set * p.price).reduce((s, n) => s + n, 0)
      return {model: {items, sum}}
    },
    preRemoveProductFromCart (model, product) {
      const p = xtend(product, {set: product.set - 1})
      return p.set >= 0
        ? {model, effect: PRE_REMOVE_PRODUCT_FROM_CART(p)}
        : {model}
    },
    removeProductFromCart (model, product) {
      const items = model.items
        .map(p => p.id === product.id ? product : p)
        .filter(p => p.set > 0)
      const sum = items.map(p => p.set * p.price).reduce((s, n) => s + n, 0)
      return {model: {items, sum}}
    }
  }),
  run: runHelper({
    PRE_REMOVE_PRODUCT_FROM_CART (effect, sources) {
      const actionsSource = through.obj()
      actionsSource.end(removeProductFromCart(effect))
      return actionsSource
    }
  })
}

module.exports = app
