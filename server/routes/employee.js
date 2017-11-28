import Router from 'express-promise-router'

import EmployeeController from '../controllers/employee'
import userController from '../controllers/users'
import websocketMiddleware from '../lib/websocket-middleware'
import {employee} from '../../common/schemas'

const sync = {schema: employee}
const saveSchema = {...sync, type: 'employee/SAVE_SUCCESS'}
const deleteSchema = {...sync, type: 'employee/DELETE_SUCCESS'}

export default () => {
  const {requiresLogin} = userController
  const {hasAuthorization, canChangeStatus} = employeeController

  const employeeRouter = Router({mergeParams: true})

  employeeRouter.route('/employee')
    .get(requiresLogin, hasAuthorization, employeeController.list)
    .post(requiresLogin, employeeController.create)

  employeeRouter.route('/employee/:employeeId')
    .get(requiresLogin, hasAuthorization, employeeController.read)
    .put(requiresLogin, hasAuthorization, canChangeStatus, employeeController.update)

  employeeRouter.route('/admin/employees/:employeeId')
    .get(employeeController.read)
    .put(websocketMiddleware(saveSchema), employeeController.update)
    .delete(websocketMiddleware(deleteSchema), employeeController.delete)

  // Finish by binding the employee middleware
  employeeRouter.param('employeeId', employeeController.employeeById)

  return employeeRouter
}
