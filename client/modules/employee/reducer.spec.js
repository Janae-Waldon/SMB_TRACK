import {utc} from 'moment'

import * as reducer from './reducer'
import {CALL_API} from '../../store/middleware/api'
import {employee as employeeSchema, arrayOfEmployees} from '../../../common/schemas'

describe('employee reducer', function() {
  describe('action creators', function() {
    it('loads all employees', function() {
      const action = reducer.loadEmployees()

      expect(action).to.have.property(CALL_API)
      const {endpoint, schema, types} = action[CALL_API]

      expect(endpoint).to.equal('employee')
      expect(schema).to.equal(arrayOfEmployees)
      expect(types.length).to.equal(3)
    })

    it('loads a employee', function() {
      const action = reducer.loadEmployee(1)

      expect(action).to.have.property(CALL_API)
      const {endpoint, schema, types} = action[CALL_API]

      expect(endpoint).to.equal('employee/1')
      expect(schema).to.equal(employeeSchema)
      expect(types.length).to.equal(3)
    })

    it('saves a employee', function() {
      const action = reducer.saveEmployee({_id: 1})

      expect(action).to.have.property(CALL_API)
      const {endpoint, method, body, schema, types} = action[CALL_API]

      expect(endpoint).to.equal('employee/1')
      expect(method).to.equal('PUT')
      expect(body).to.eql({_id: 1})
      expect(schema).to.equal(employeeSchema)
      expect(types.length).to.equal(3)
    })

    it('deletes a employee', function() {
      const action = reducer.deleteEmployee(1)

      expect(action).to.have.property(CALL_API)
      const {endpoint, method, schema, types} = action[CALL_API]

      expect(endpoint).to.equal('admin/employees/1')
      expect(method).to.equal('DELETE')
      expect(schema).to.equal(employeeSchema)
      expect(types.length).to.equal(3)
    })
  })

  describe('selectors', function() {
    let selectors, state
    const lastWeek = new Date().setDate(new Date().getDate() - 7)

    before(function() {
      selectors = reducer.createSelectors('employee')
      state = {
        employee: {ids: [1, 2, 3]},
        entities: {
          employees: {
            1: {_id: 1, status: 'Accepted', lastPacked: utc().startOf('isoWeek')},
            2: {_id: 2, status: 'Accepted', lastPacked: utc(lastWeek).startOf('isoWeek')},
            3: {_id: 3, status: 'Pending', lastPacked: utc().startOf('isoWeek')}
          }
        }
      }
    })

    it('getAll', function() {
      const result = selectors.getAll(state)
      expect(result).to.be.an('array')
      expect(result.length).to.equal(3)
      expect(result[0]).to.eql(state.entities.employees[1])
    })

    it('getOne', function() {
      const result = selectors.getOne(state)(1)
      expect(result).to.be.an('object')
      expect(result).to.eql(state.entities.employees[1])
    })

    it('getScheduled', function() {
      const result = selectors.getScheduled(state)
      expect(result).to.be.an('array')
      expect(result.length).to.equal(1)
      expect(result[0]).to.eql(state.entities.employees[2])
    })
  })
})
