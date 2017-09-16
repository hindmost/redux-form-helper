redux-form-helper
===============

ES6 class that helps build controlled form components with React/Redux and simplifies form validation and handling.

It has no dependencies and supposed to be used as a member of React component.

[Demo](https://hindmost.github.io/redux-advanced-todos-example/)

## Installation

```
npm install --save redux-form-helper
```

## How to use

The first step is add specific data to Redux state which will represent the state of our form.
These data will include current field values as well as set of error flags for each field in the form.
The form state may be added to an existing reducer or defined in a separate reducer.
Furthermore it's necessary to define specific action initiating update of the form state as well as respective action creator.

#### Action example:

``` javascript
export const FORM_UPDATE = 'FORM_UPDATE' 

export const doFormUpdate = (data, errors) => {
  return { type: FORM_UPDATE, data, errors }
}
...
```

#### Reducer example:

``` javascript
...
const initialState = {
  formData: {
    field1: '',
    ...
  },
  formErrors: {
  },
  ...
}

export default function reducer (state = initialState, action) {
  switch (action.type) {
    case FORM_UPDATE:
      return {
        ...ret,
        formData: Object.assign({}, formData, action.data || {}),
        formErrors: Object.assign({}, formErrors, action.errors || {})
      }
    ...
  }
}
```

The second and final step is create a container component for our form and connect it with respective part of Redux state and actions.
Also we need to define a form model specifying validation of form fields.
Now we instantiate `ReduxFormHelper` object as a member of the component and pass there our form model and a callback dispatching update of the form state.
Then in the component's `render()` method we have to bind each field's `onChange` and the form's `onSubmit` events with `processField()` and `processForm()` methods respectively as well as display error blocks for each field depending on the form error flags in the state.
The example below uses CSS from Twitter Bootstrap framework.

#### Container Component example:

``` javascript
import React, {Component} from 'react';
import {connect} from 'react-redux'
import ReduxFormHelper from 'redux-form-helper'

class MyForm extends Component {
  constructor(props) {
    super(props);
    this.helper = new ReduxFormHelper(props)
    this.helper.resetForm();
  }

  onChange(e) {
    this.helper.processField(e)
  }

  onSubmit(e) {
    e.preventDefault()
    let {onSubmitForm} = this.props
    let ret = this.helper.processForm(e)
    ret && onSubmitForm(ret)
  }

  render() {
    let {formData, formErrors} = this.props
    return (
  <div>
    {!!formErrors._flag &&
      <div className="alert" role="alert">
        Form has one or more errors.
      </div>
    }
    <form onSubmit={this.onSubmit.bind(this)} >
      <div className={'form-group' + (formErrors['field1']? ' has-error': '')}>
        <label>Field 1 *</label>
        <input type="text" name="field1" value={formData.field1} onChange={this.onChange.bind(this)} className="form-control" />
        {!!formErrors['field1'] &&
        <span className="help-block">
          {formErrors['field1'] === 'invalid'? 'Must be a string of 2-50 characters' : 'Required field'}
        </span>
        }
      </div>
      ...
      <button type="submit" className="btn btn-default">Submit</button>
    </form>
  </div>
    )
  }
}

const formModel = {
  field1: {
    required: true,
    validate: (value) => value.length >= 2 && value.length <= 50
  },
  ...
}

function mapStateToProps (state) {
  return {
    formData: state.formData, formErrors: state.formErrors,
    formModel
  }
}

function mapDispatchToProps (dispatch) {
  return {
    onUpdateForm: (data, errors) => {
      dispatch(doFormUpdate(data, errors))
    },
    onSubmitForm: (data) => {
      // dispatch some action which somehow updates state with form data
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MyForm)
```


## API

#### new ReduxFormHelper(options)

Creates a new ReduxFormHelper instance.

`options` - object of two properties:

* `formModel`

    map specifying how validation is applied to form fields. Object of (field name -> attributes) pairs. Must comply with the following structure:
    ```
    {
      "fieldName": {
        "required": true|false, // whether a field is required. Default: false
        "validate": function (value) {...} || null // function returning true, if value passes validation, and false otherwise. Default: null
        "numeric": true|false, // whether value of a field has to be coerced to number. Default: false
      },
      ...
    }
    ```
    Note that an empty field in a form is treated as valid unless "required" attribute is set for this field in the map.
    All field attributes are optional. Also it is not necessary for each field in a form to have respective property in the map. If some field's name is missing in the map, no validation is applied to this field.

* `onUpdateForm`

    function to be called when the form state has to be updated. Supposed to dispatch some Redux action. Taking two arguments:

    * `data` - data representing the current field values. Object of (field name -> value) pairs.
    * `errors` - map of boolean flags indicating whether a field has an error. Object of (field name -> error flag) pairs.


#### resetForm()

Clear all data in the form state.

#### processField(event)

Handles `onChange` event on the current field and initiates update of the form state. Receives [`Event`](https://developer.mozilla.org/en-US/docs/Web/API/Event) object.

#### processForm(event)

Handles `onSubmit` event of the form, initiates update of the form state and returns JSON representation of the form. Receives [`Event`](https://developer.mozilla.org/en-US/docs/Web/API/Event) object.
