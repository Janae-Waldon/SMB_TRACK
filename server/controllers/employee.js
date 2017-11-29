import {extend, intersection, includes} from 'lodash'

import {ForbiddenError, NotFoundError} from '../lib/errors'
import {ADMIN_ROLE, clientRoles, employeeStatus} from '../../common/constants'
import Employee from '../models/employee'
import mailer from '../lib/mail/mail-helpers'
import User from '../models/user'
import {updateFields} from '../lib/update-linked-fields'


export default {
  /**
   * Create a employee
   */
  async create(req, res) {
    let employee = new Employee(req.body)
    employee._id = req.user.id

    await User.findOneAndUpdate(
      {_id: employee._id},
      {$push: {roles: clientRoles.EMPLOYEE}}
    )

    const savedEmployee = await employee.save()
    updateFields(clientRoles.EMPLOYEE, req.body.fields, employee._id)
    res.json(savedEmployee)

    // mailer.send(config.mailer.to, 'A new client has applied.', 'create-employee-email')
  },

  /**
   * Show the current employee
   */
  read(req, res) {
    res.json(req.employee)
  },

  /**
   * Update a employee
   */
  async update(req, res) {
    const employee = extend(req.employee, req.body)

    const oldEmployee = await Employee.findById(employee._id)
    const newEmployee = await employee.save()

    if (newEmployee.status !== oldEmployee.status) {
      mailer.sendStatus(newEmployee)
    } else {
      mailer.sendUpdate(newEmployee)
    }
    updateFields(clientRoles.EMPLOYEE, req.body.fields, employee._id)
    res.json(newEmployee)
  },

  /**
   * List employees
   */
  async list(req, res) {
    const employees = await Employee.find()
      .sort('-dateReceived')
      .populate('user', 'displayName')
      .populate('assignedTo', 'firstName lastName')
    res.json(employees)
  },

  /**
   * Delete employee
   */
  async delete(req, res) {
    const id = req.employee._id

    await User.findByIdAndRemove(id)
    await Employee.findByIdAndRemove(id)

    res.json(req.employee)
  },
  /**
   * Employee middleware
   */
  async employeeById(req, res, next, id) {
    const employee = await Employee.findById(id)

    if (!employee) throw new NotFoundError

    req.employee = employee
    next()
  },

  /**
   * Employee authorization middleware
   */
  hasAuthorization(req, res, next) {
    const authorizedRoles = [
      ADMIN_ROLE,
    ]

    if (req.user && intersection(req.user.roles, authorizedRoles).length) {
      return next()
    }

    if (!req.employee || req.employee._id !== +req.user.id)
      throw new ForbiddenError

    next()
  },

  /**
   * Employee Middleware
   */
  async canChangeStatus(req, res, next) {
    const unrestrictedRoles = [
      ADMIN_ROLE,
    ]
    const restrictedStatus = [
      employeeStatus.REJECTED,
      employeeStatus.PENDING,
    ]

    if (req.user && !intersection(req.user.roles, unrestrictedRoles).length) {
      const statusChanged = req.employee.status !== req.body.status
      if (statusChanged && includes(restrictedStatus, req.employee.status))
        throw new ForbiddenError
    }

    next()
  }
}
