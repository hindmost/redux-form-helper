export default class ReduxFormHelper {
  constructor(props = {}) {
    let {formModel, onUpdateForm} = props
    this.props = typeof formModel === 'object' &&
      typeof onUpdateForm === 'function' && {formModel, onUpdateForm}
  }

  resetForm (defaults = {}) {
    if (!this.props) return false
    let {formModel, onUpdateForm} = this.props
    let data = {}, errors = {_flag: false}
    for (let name in formModel) {
      data[name] = name in defaults? defaults[name] :
        ('default' in formModel[name]? formModel[name].default : '')
      errors[name] = false
    }
    onUpdateForm(data, errors)
  }

  processField (event) {
    if (!this.props || !event.target) return false
    let {formModel, onUpdateForm} = this.props
    let {name, value, error, within} = this._processField(event.target, formModel)
    let data = {}, errors = {_flag: false}
    if (name) {
      value !== false && within && (data[name] = value)
      errors[name] = error
    }
    onUpdateForm(data, errors)
    return !error && data
  }

  processForm (event) {
    if (!this.props || !event.target) return false
    let form = event.target
    if (!form || !form.elements) return false
    let fields = form.elements
    let {formModel, onUpdateForm} = this.props
    let data = {}, errors = {}, ret = {}, flag = false
    for (let n = fields.length, i = 0; i < n; i++) {
      let {name, value, error, within} = this._processField(fields[i], formModel)
      if (name) {
        value !== false && within && (data[name] = value)
        value !== false && !error && (ret[name] = value)
        errors[name] = error
        error && (flag = true)
      }
    }
    errors._flag = flag
    onUpdateForm(data, errors)
    return !flag && ret
  }

  _processField (field, formModel) {
    if (!field || !field.name || !('value' in field))
      return {name: false, value: false, error: false, within: false}
    let name = field.name
    let value = field.value
    if (!formModel || !formModel[name])
      return {name, value, error: false, within: false}
    let model = formModel[name]
    if (model.required && value === '')
      return {name, value, error: 'missing', within: true}
    if (model.validate && value !== '') {
      let fn = model.validate
      if (typeof fn === 'function' && !fn(value))
        return {name, value, error: 'invalid', within: true}
    }
    if (model.numeric && isNaN(value = Number(value)))
      return {name, value: 0, error: 'invalid', within: true}
    return {name, value, error: false, within: true}
  }
}
