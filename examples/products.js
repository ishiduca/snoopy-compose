const yo = require('yo-yo')
const xtend = require('xtend')
const {through} = require('@ishiduca/snoopy')
const {creator, updateHelper, runHelper} = require('./helpers')

const preAddProductToCart = creator('preAddProductToCart')
const addProductToCart = creator('addProductToCart')
const PRE_ADD_PRODUCT_TO_CART = creator('PRE_ADD_PRODUCT_TO_CART')

const app = {
  init () {
    return {
      model: [
        {
          id: 12345,
          name: 'DroidBrade',
          price: 771,
          stock: 9
        },
        {
          id: 12346,
          name: 'hackr 2',
          price: 335,
          stock: 0
        },
        {
          id: 12347,
          name: 'hackr 3',
          price: 1021,
          stock: 2
        }
      ]
    }
  },
  update: updateHelper({
    preAddProductToCart (model, product) {
      return product.stock > 0
        ? {model, effect: PRE_ADD_PRODUCT_TO_CART(xtend(product, {stock: product.stock - 1}))}
        : {model}
    },
    addProductToCart (model, product) {
      return {
        model: model.map(
          p => (
            p.id !== product.id
              ? p
              : product
          )
        )
      }
    },
    removeProductFromCart (model, product) {
      return {
        model: model.map(
          p => (
            p.id !== product.id
              ? p
              : xtend(p, {stock: p.stock + 1})
          )
        )
      }
    }
  }),
  run: runHelper({
    ERROR (err, sources) {
      console.error(err)
    },
    PRE_ADD_PRODUCT_TO_CART (product, sources) {
      const actionsSource = through.obj()
      actionsSource.end(addProductToCart(product))
      return actionsSource
    }
  }),
  view (model, actionsUp) {
    return yo`
      <div>
        <table class="table is-striped">
          <thead>
            <tr>
              <th>product</th>
              <th>stock</th>
              <th>price</th>
              <th>add to cart</th>
            </tr>
          </thead>
          <tbody>
            ${model.map(p => yo`
              <tr>
                <td><strong>${p.name}</strong></td>
                <td>${p.stock}</td>
                <td>${p.price} yen</td>
                <td>
                  ${b(p.stock ? 'add' : 'sold out', p.stock <= 0, e => actionsUp(preAddProductToCart(p)))}
                </td>
              </tr>
            `)}
          </tbody>
        </table>
      </div>
    `
    function b (context, disabled, onclick) {
      const btn = yo`
        <a class="button" onclick=${onclick}>${context}</a>
      `
      if (disabled) btn.setAttribute('disabled', 'disabled')
      return btn
    }
  }
}

module.exports = app
