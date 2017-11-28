import React from 'react'
import {Route} from 'react-router-dom'

import {ADMIN_ROLE, clientRoles} from '../../../common/constants'
import Home from '../core/components/Home'
import EmployeeList from './components/EmployeeList'
import EmployeeView from './components/EmployeeView'
import EmployeeEdit from './components/EmployeeEdit'
import EmployeeCreate from './components/Create'
import ClientCreateSuccess from '../../components/ClientCreateSuccess'
import requireRole from '../../components/router/requireRole'
import ownerOrAdmin from '../../components/router/ownerOrAdmin'
import SwitchWithNotFound from '../../components/router/SwitchWithNotFound'

import './employee.css'

const IsAdmin = requireRole([ADMIN_ROLE])
const IsEmployee = requireRole([clientRoles.EMPLOYEE, ADMIN_ROLE])
const Owns = ownerOrAdmin('employeeId')

const EmployeeRouter = ({match}) =>
  <SwitchWithNotFound>
    <Route path={match.url} exact component={IsEmployee(Home)} />
    <Route path={`${match.url}/list`} exact component={IsAdmin(EmployeeList)} />
    <Route
      path={`${match.url}/create/success`}
      exact
      component={IsEmployee(ClientCreateSuccess)}
    />
    <Route
      path={`${match.url}/create`}
      exact
      component={EmployeeCreate}
    />
    <Route
      path={`${match.url}/:employeeId/edit`}
      exact
      component={Owns(EmployeeEdit)}
    />
    <Route
      path={`${match.url}/:employeeId`}
      exact
      component={Owns(EmployeeView)}
    />
  </SwitchWithNotFound>

export default EmployeeRouter
