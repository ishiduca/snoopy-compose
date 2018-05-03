const creator = type => value => ({type, value})
const updateHelper = mapper => (model, action) => (
  mapper[action.type]
    ? mapper[action.type](model, action.value)
    : {model}
)
const runHelper = mapper => (effect, sources) => (
  mapper[effect.type]
    ? mapper[effect.type](effect.value, sources)
    : null
)
module.exports = {creator, updateHelper, runHelper}
