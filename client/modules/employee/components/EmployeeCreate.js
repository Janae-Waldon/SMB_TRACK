import React, {Component} from 'react'
import {flatten, omit} from 'lodash'
import {connect} from 'react-redux'
import {submit} from 'redux-form'
import {push} from 'react-router-redux'
import {Link} from 'react-router-dom'
import {Button} from 'react-bootstrap'

import {
  ADMIN_ROLE,
//  clientRoles,
} from '../../../../common/constants'
import userClientRole from '../../../lib/user-client-role'
import selectors from '../../../store/selectors'
import {saveEmployee} from '../reducer'
import {loadUser} from '../../users/authReducer'

import {Page, PageHeader, PageBody} from '../../../components/page'
import AssistanceInfo from '../../../components/AssistanceInfo'

const mapStateToProps = state => ({
  user: selectors.auth.getUser(state),
  savingEmployees: selectors.employee.saving(state),
  saveEmployeesError: selectors.employee.saveError(state),
  loadingUser: selectors.auth.fetching(state),
  settings: selectors.settings.getSettings(state),
})

const mapDispatchToProps = dispatch => ({
  saveEmployee: employee => dispatch(saveEmployee(employee)),
  loadUser: () => dispatch(loadUser()),
  push: route => dispatch(push(route)),
  submit: form => dispatch(submit(form))
})

class EmployeeCreate extends Component {
  constructor(props) {
    super(props)
    this.isAdmin = this.props.user.roles.find(r => r === ADMIN_ROLE)
    this.state = {
      employee: {
        ...omit(this.props.user, '_id'),
      },
      pendingEmployee: {}
    }
  }

  componentWillReceiveProps(nextProps) {
    const {loadingUserData, user} = nextProps
    if (this.props.loadingUserData && !loadingUserData) {
      const role = userClientRole(user)
      if (!role) return

      const userData = [
        this.state.employee
      ]

      this.setState({
        employee: {
          ...this.state.employee,
          fields: flatten(userData.filter(x => x).map(data => data.fields))
        }
      })
    }

    if (this.props.savingEmployees && !nextProps.savingEmployees &&
        !nextProps.saveEmployeesError) {
      this.props.loadUser()
      // delay updating state.employee and causing form reinitialization, clearing
      // dirty prop, until save succeeds
      this.setState({employee: this.state.pendingEmployee})
    }

    if (this.props.loadingUser && !nextProps.loadingUser) {
      this.props.push(this.isAdmin ? '/employees/list' : '/employees')
    }
  }

  render() {
    const {settings, loading} = this.props
    const error = this.props.saveEmployeesError || this.props.loadError

    return (
      <Page loading={loading}>
        <PageHeader
          heading="Client Request for Assistance Application"
          showLogo
          center
        >
          {settings &&
            <AssistanceInfo
              settings={settings}
              heading="Please fill out the following form"
            >
              <p>To check on your application status, you may call our client intake line at {settings.clientIntakeNumber.replace(/ /g, "\u00a0")}.
              </p>
              <p>Once submitted, your application will be reviewed and you will be contacted directly.
              </p>
            </AssistanceInfo>
          }
        </PageHeader>
        <PageBody error={error}>
          <form onSubmit={this.saveEmployee}>
            
            
            <div className="text-right">
              <Button
                type="button"
                onClick={this.submit}
                bsStyle="success"
              >
                Submit
              </Button>
              {' '}
              <Link
                to={this.isAdmin ? '/employees/list' : '/'}
                className="btn btn-primary"
              >
                Cancel
              </Link>
            </div>
          </form>
        </PageBody>
      </Page>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EmployeeCreate)
