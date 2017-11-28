import {denormalize} from 'normalizr'
import {createSelector} from 'reselect'
import {get} from 'lodash'
import {utc} from 'moment'

import {employee as employeeSchema, arrayOfEmployees} from '../../../common/schemas'
import {CALL_API} from '../../store/middleware/api'
import {crudActions, crudReducer} from '../../store/utils'

export const actions = crudActions('employee')

export const loadEmployees = () => ({
  [CALL_API]: {
    endpoint: 'employee',
    schema: arrayOfEmployees,
    types: [actions.LOAD_ALL_REQUEST, actions.LOAD_ALL_SUCCESS, actions.LOAD_ALL_FAILURE]
  }
})

export const loadEmployee = id => ({
  [CALL_API]: {
    endpoint: `employee/${id}`,
    schema: employeeSchema,
    types: [actions.LOAD_ONE_REQUEST, actions.LOAD_ONE_SUCCESS, actions.LOAD_ONE_FAILURE]
  }
})

export const saveEmployee = employee => {
  const endpoint = employee._id ? `employee/${employee._id}` : `employee`
  return {
    [CALL_API]: {
      endpoint,
      method: employee._id ? 'PUT' : 'POST',
      body: employee,
      schema: employeeSchema,
      types: [actions.SAVE_REQUEST, actions.SAVE_SUCCESS, actions.SAVE_FAILURE]
    },
    meta: {submitValidate: true}
  }
}

export const deleteEmployee = id => ({
  [CALL_API]: {
    endpoint: `admin/employees/${id}`,
    method: 'DELETE',
    schema: employeeSchema,
    types: [actions.DELETE_REQUEST, actions.DELETE_SUCCESS, actions.DELETE_FAILURE]
  }
})

export default crudReducer('employee')