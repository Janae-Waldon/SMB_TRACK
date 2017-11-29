import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'
import {BootstrapTable, TableHeaderColumn, SizePerPageDropDown} from 'react-bootstrap-table'
import 'react-bootstrap-table/dist/react-bootstrap-table.min.css'

import {fieldTypes} from '../../../../common/constants'
import selectors from '../../../store/selectors'
import {loadEmployees} from '../reducer'

import {Box, BoxBody, BoxHeader} from '../../../components/box'
import ClientStatusLabel from '../../../components/ClientStatusLabel'
import {Page, PageBody} from '../../../components/page'

const mapStateToProps = state => ({
  employees: selectors.employee.getAll(state),
})

const mapDispatchToProps = dispatch => ({
  loadEmployees: () => dispatch(loadEmployees()),
})

class EmployeeList extends Component {
  componentWillMount() {
    this.props.loadEmployees()
  }

  getStatusLabel = (_, employee) => <ClientStatusLabel client={employee} />

  getActionButtons = (_, employee) =>
    <div>
      <Link
        to={`/employees/${employee._id}`}
        className="btn btn-info btn-sm"
      ><i className="fa fa-eye" /></Link>
      {' '}
      <Link
        to={`/employees/${employee._id}/edit`}
        className="btn btn-primary btn-sm"
      ><i className="fa fa-pencil" /></Link>
    </div>

  formatData = () => this.props.employees ?
    this.props.employees.map(c => ({
      ...c,
      assignedTo: c.assignedTo && c.assignedTo.fullName
    })) :
    []

  renderSizePerPageDropDown = () => <SizePerPageDropDown variation='dropup'/>

  render() {
    const {loading, loadError} = this.props

    return (
      <Page>
        <PageBody>
          <Box>
            <BoxHeader heading="Employees" />
            <BoxBody
              loading={loading}
              error={loadError}
            >
              <BootstrapTable
                data={this.formatData()}
                keyField="_id"
                options={{
                  defaultSortName: "_id",
                  defaultSortOrder: 'desc',
                  noDataText: loading ? '' : 'No employees found',
                  sizePerPageDropDown: this.renderSizePerPageDropDown
                }}
                hover
                striped
                pagination
                search
              >
                <TableHeaderColumn dataField="_id" width="70px" dataSort>#</TableHeaderColumn>
                <TableHeaderColumn dataField="fullName" dataSort>Name</TableHeaderColumn>
                <TableHeaderColumn dataField="address">Address</TableHeaderColumn>
                <TableHeaderColumn dataField="email" dataSort>Email</TableHeaderColumn>
                <TableHeaderColumn
                  width="90px"
                >
                  Household
                </TableHeaderColumn>
                <TableHeaderColumn dataField="assignedTo" dataSort>Driver</TableHeaderColumn>
                <TableHeaderColumn
                  dataField="status"
                  dataFormat={this.getStatusLabel}
                  dataAlign="center"
                  width="90px"
                  dataSort
                >
                  Status
                </TableHeaderColumn>
                <TableHeaderColumn
                  dataFormat={this.getActionButtons}
                  dataAlign="center"
                  width="100px"
                />
              </BootstrapTable>
            </BoxBody>
          </Box>
        </PageBody>
      </Page>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EmployeeList)
