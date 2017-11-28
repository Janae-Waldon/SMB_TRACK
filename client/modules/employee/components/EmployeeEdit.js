import React, {Component} from 'react'
import {connect} from 'react-redux'
import {submit} from 'redux-form'
import {push} from 'react-router-redux'
import {Link} from 'react-router-dom'
import {ButtonToolbar, Button} from 'react-bootstrap'

import {ADMIN_ROLE, questionnaireIdentifiers} from '../../../../common/constants'
import {toForm, fromForm} from '../../../lib/questionnaire-helpers'
import selectors from '../../../store/selectors'
import {loadEmployee, saveEmployee} from '../reducer'
import {loadQuestionnaires} from '../../questionnaire/reducers/api'
import {loadFoods} from '../../food/reducers/category'

import {Box, BoxHeader, BoxBody} from '../../../components/box'
import {Page, PageHeader, PageBody} from '../../../components/page'
import {Questionnaire} from '../../../components/questionnaire'

const FORM_NAME = 'questionnaireForm'

const mapStateToProps = (state, ownProps) => ({
  user: selectors.auth.getUser(state),
  savingEmployees: selectors.employee.saving(state),
  saveEmployeesError: selectors.employee.saveError(state),
  getEmployee: selectors.employee.getOne(state),
  employeeId: ownProps.match.params.employeeId,
  questionnaire: selectors.questionnaire.getOne(state)(questionnaireIdentifiers.EMPLOYEE),
  foodCategories: selectors.food.category.getAll(state),
  loading: selectors.questionnaire.loading(state) ||
    selectors.employee.loading(state) || selectors.food.category.loading(state),
  loadError: selectors.questionnaire.loadError(state) ||
    selectors.employee.loadError(state) || selectors.food.category.loadError(state)
})

const mapDispatchToProps = dispatch => ({
  loadEmployee: (id, admin) => dispatch(loadEmployee(id, admin)),
  saveEmployee: (employee, admin) => dispatch(saveEmployee(employee, admin)),
  loadQuestionnaires: () => dispatch(loadQuestionnaires()),
  loadFoods: () => dispatch(loadFoods()),
  submit: form => dispatch(submit(form)),
  push: to => dispatch(push(to))
})

class EmployeeEdit extends Component {
  constructor(props) {
    super(props)
    this.isAdmin = this.props.user.roles.find(r => r === ADMIN_ROLE)
  }

  componentWillMount() {
    this.props.loadEmployee(this.props.employeeId, this.isAdmin)
    this.props.loadQuestionnaires()
    this.props.loadFoods()
  }

  saveEmployee = form =>
    this.props.saveEmployee(fromForm(form), this.isAdmin)

  saveEmployeeStatus = status => () => {
    const employee = this.props.getEmployee(this.props.employeeId)
    if (!employee) return
    this.props.saveEmployee({
      ...employee,
      status
    }, this.isAdmin)
  }

  handleSubmitSuccess = () =>
    this.props.push(this.isAdmin ? '/employees/list' : '/employees')

  submit = () => this.props.submit(FORM_NAME)

  render() {
    const {
      getEmployee,
      employeeId,
      questionnaire,
      foodCategories,
      loading,
      savingEmployees
    } = this.props
    const employee = getEmployee(employeeId)
    const error = this.props.saveEmployeesError || this.props.loadError

    return (
      <Page loading={loading}>
        <PageHeader heading={employee && employee.fullName} />
        <PageBody error={error}>
          <form onSubmit={this.saveEmployee}>
            {questionnaire && employee && foodCategories && !loading &&
              <Questionnaire
                form={FORM_NAME}
                questionnaire={questionnaire}
                loading={savingEmployees}
                onSubmit={this.saveEmployee}
                onSubmitSuccess={this.handleSubmitSuccess}
                initialValues={toForm(employee, questionnaire)}
              />
            }
            { employee && !loading && employee.status !== "Rejected" &&
            <Box>
              <BoxHeader heading="Status" />
              <BoxBody loading={savingEmployees}>
                <p>
                  You
                  {employee.status === 'Accepted' ? ' will ' : ' won\'t ' }
                  receive deliveries.
                </p>
                { employee.status !== 'Pending' &&
                  <ButtonToolbar>
                    <Button
                      bsStyle="success"
                      active={employee.status === 'Accepted'}
                      disabled={savingEmployees || employee.status === 'Accepted'}
                      onClick={this.saveEmployeeStatus('Accepted')}
                    >
                      Available
                    </Button>
                    <Button
                      bsStyle="warning"
                      active={employee.status === 'Inactive'}
                      disabled={savingEmployees || employee.status === 'Inactive'}
                      onClick={this.saveEmployeeStatus('Inactive')}
                    >
                      Away
                    </Button>
                  </ButtonToolbar>
                }
              </BoxBody>
            </Box>
            }
            <div className="text-right">
              <Button
                type="button"
                onClick={this.submit}
                bsStyle="success"
              >
                Update
              </Button>
              {' '}
              <Link
                className="btn btn-primary"
                to={this.isAdmin ? '/employees/list' : '/employees'}
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

export default connect(mapStateToProps, mapDispatchToProps)(EmployeeEdit)
