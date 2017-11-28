import React, {Component} from 'react'
import {flatten, omit} from 'lodash'
import {connect} from 'react-redux'
import {submit} from 'redux-form'
import {push} from 'react-router-redux'
import {Link} from 'react-router-dom'
import {Button} from 'react-bootstrap'

import {
  ADMIN_ROLE,
  clientRoles,
  questionnaireIdentifiers
} from '../../../../common/constants'
import {fromForm, toForm} from '../../../lib/questionnaire-helpers'
import userClientRole from '../../../lib/user-client-role'
import selectors from '../../../store/selectors'
import {saveEmployee} from '../reducer'
import {loadUser} from '../../users/authReducer'

import {Page, PageHeader, PageBody} from '../../../components/page'
import AssistanceInfo from '../../../components/AssistanceInfo'
import {Questionnaire} from '../../../components/questionnaire'

const FORM_NAME = 'questionnaireForm'

const mapStateToProps = state => ({
  user: selectors.auth.getUser(state),
  savingEmployees: selectors.employee.saving(state),
  saveEmployeesError: selectors.employee.saveError(state),
  questionnaire: selectors.questionnaire.getOne(state)(questionnaireIdentifiers.EMPLOYEE),
  loading: selectors.questionnaire.loading(state) ||
    selectors.settings.fetching(state) || selectors.food.category.loading(state),
  loadError: selectors.questionnaire.loadError(state) ||
    selectors.settings.error(state) || selectors.food.category.loadError(state),
  loadingUserData: selectors.donor.loading(state) || selectors.volunteer.loading(state),
  loadingUser: selectors.auth.fetching(state),
  settings: selectors.settings.getSettings(state),
  getDonor: selectors.donor.getOne(state),
  getVolunteer: selectors.volunteer.getOne(state)
})

const mapDispatchToProps = dispatch => ({
  saveEmployee: employee => dispatch(saveEmployee(employee)),
  loadQuestionnaires: () => dispatch(loadQuestionnaires()),
  loadFoods: () => dispatch(loadFoods()),
  loadDonor: id => dispatch(loadDonor(id)),
  loadVolunteer: id => dispatch(loadVolunteer(id)),
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
        household: [],
        foodPreferences: [],
        fields: []
      },
      pendingEmployee: {}
    }
  }
  componentWillMount() {
    this.props.loadQuestionnaires()
    this.props.loadFoods()
    const role = userClientRole(this.props.user)
    if (role === clientRoles.DONOR) this.props.loadDonor(this.props.user._id)
    if (role === clientRoles.VOLUNTEER) this.props.loadVolunteer(this.props.user._id)
  }

  componentWillReceiveProps(nextProps) {
    const {loadingUserData, getVolunteer, getDonor, user} = nextProps
    if (this.props.loadingUserData && !loadingUserData) {
      const role = userClientRole(user)
      if (!role) return

      const userData = [
        getDonor(user._id),
        getVolunteer(user._id),
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

  saveEmployee = form => {
    const pendingEmployee = fromForm(form)
    this.setState({pendingEmployee})
    this.props.saveEmployee(pendingEmployee, this.isAdmin)
  }

  submit = () => this.props.submit(FORM_NAME)

  render() {
    const {settings, questionnaire, loading, loadingUser, savingEmployees} = this.props
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
            {questionnaire &&
              <Questionnaire
                form={FORM_NAME}
                questionnaire={questionnaire}
                loading={savingEmployees || loadingUser}
                onSubmit={this.saveEmployee}
                initialValues={toForm(this.state.employee, questionnaire)}
              />
            }
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
