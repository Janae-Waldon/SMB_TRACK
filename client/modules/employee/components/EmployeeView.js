import React, {Component} from 'react'
import {connect} from 'react-redux'
import {push} from 'react-router-redux'
import {Link} from 'react-router-dom'
import {ButtonToolbar, Button} from 'react-bootstrap'

import selectors from '../../../store/selectors'
import {loadEmployee, saveEmployee, deleteEmployee} from '../reducer'
import {showConfirmDialog, hideDialog} from '../../core/reducers/dialog'

import {Box, BoxHeader, BoxBody} from '../../../components/box'
import {Page, PageHeader, PageBody} from '../../../components/page'

const mapStateToProps = (state, ownProps) => ({
  user: selectors.auth.getUser(state),
  savingEmployees: selectors.employee.saving(state),
  saveEmployeesError: selectors.employee.saveError(state),
  getEmployee: selectors.employee.getOne(state),
  employeeId: ownProps.match.params.employeeId,
})

const mapDispatchToProps = dispatch => ({
  loadEmployee: (id, admin) => dispatch(loadEmployee(id, admin)),
  saveEmployee: (employee, admin) => dispatch(saveEmployee(employee, admin)),
  deleteEmployee: id => dispatch(deleteEmployee(id)),
  loadFormData: () => {
  },
  showDialog: (cancel, confirm, message) =>
    dispatch(showConfirmDialog(cancel, confirm, message, 'Delete')),
  hideDialog: () => dispatch(hideDialog()),
  push: route => dispatch(push(route))
})

class EmployeeView extends Component {
  constructor(props) {
    super(props)
    this.isAdmin = this.props.user.roles.find(r => r === ADMIN_ROLE)
    this.state = {deleting: false}
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.savingEmployees && !nextProps.savingEmployees && this.state.deleting) {
      this.setState({deleting: false})

      if (!nextProps.saveEmployeesError) {
        this.props.push('/employees/list')
      }
    }
  }

  componentWillMount() {
    this.props.loadEmployee(this.props.employeeId, this.isAdmin)
    this.props.loadFormData()
  }

  saveEmployee = status => () => {
    const employee = this.props.getEmployee(this.props.employeeId)
    if (!employee) return
    this.props.saveEmployee({
      ...employee,
      status
    }, this.isAdmin)
  }

  confirmDelete = employee => () => this.props.showDialog(
    this.props.hideDialog,
    this.deleteEmployee(employee._id),
    `Employee ${employee.fullName} will be permanently deleted`
  )

  deleteEmployee = id => () => {
    this.setState({deleting: true})
    this.props.deleteEmployee(id)
    this.props.hideDialog()
  }

  render() {
    const {getEmployee, saveEmployeesError} = this.props
    const employee = getEmployee(this.props.employeeId)
    const loading = this.props.loading || this.props.savingEmployees

    return (
      <Page>
        <PageHeader heading={employee && employee.fullName} />
        <PageBody error={saveEmployeesError}>
          {employee &&
              model={employee}
              loading={loading}
            />
          }

          {employee && this.isAdmin &&
            <Box>
              <BoxHeader heading={`Status: ${employee.status}`} />
              <BoxBody loading={loading}>
                <ButtonToolbar>
                  <Button
                    bsStyle="success"
                    active={employee.status === 'Accepted'}
                    disabled={loading || employee.status === 'Accepted'}
                    onClick={this.saveEmployee('Accepted')}
                  >
                    Accept
                  </Button>
                  <Button
                    bsStyle="danger"
                    active={employee.status === 'Rejected'}
                    disabled={loading || employee.status === 'Rejected'}
                    onClick={this.saveEmployee('Rejected')}
                  >
                    Reject
                  </Button>
                  <Button
                    bsStyle="warning"
                    active={employee.status === 'Inactive'}
                    disabled={loading || employee.status === 'Inactive'}
                    onClick={this.saveEmployee('Inactive')}
                  >
                    Inactive
                  </Button>
                </ButtonToolbar>
              </BoxBody>
            </Box>
          }
          {employee && (this.isAdmin ?
            <div className="text-right">
              <Button
                bsStyle="danger"
                onClick={this.confirmDelete(employee)}
              >
                Delete
              </Button>
              {' '}
              <Link
                className="btn btn-success"
                to={`/employees/${employee._id}/edit`}
              >
                Edit
              </Link>
              {' '}
              <Link
                className="btn btn-primary"
                to="/employees/list"
              >
                Cancel
              </Link>
            </div> :
            <div className="text-right">
              <Link
                className="btn btn-success"
                to={`/employees/${employee._id}/edit`}
              >
                Edit
              </Link>
              {' '}
              <Link className="btn btn-primary" to="/employees">Cancel</Link>
            </div>
          )}
        </PageBody>
      </Page>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EmployeeView)
