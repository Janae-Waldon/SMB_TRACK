import mongoose from 'mongoose'

import {modelTypes} from '../../common/constants'

const EmployeeSchema = new Schema({
  _id: {
    type: Number,
    ref: modelTypes.USER
  },
  firstName: {
    type: String,
    required: true
  },
  middleName: {
    type: String,
    required: false
  }
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  disclaimerAgree: {
    type: Boolean
  },
  disclaimerSign: {
    type: String,
    trim: true
  },
  dateReceived: {
    type: Date,
    default: Date.now
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  zip: {
    type: String
    required: true
  },
  state: {
    type: String
    required: true
  },
  phone: {
    type: Number
    required: true
  },
  position: {
    type: String
    required: true
  },
  socialSecurity: {
    type: Number
    required: true
  },
}, {
  id: false
})

/**
 * Virtual getters & setters
 */
EmployeeSchema.virtual('fullName').get(function() {
  var fullName = this.firstName ? this.firstName + ' ' : ''
  fullName += this.middleName ? this.middleName + ' ' : ''
  fullName += this.lastName ? this.lastName : ''
  return fullName
})

EmployeeSchema.virtual('fullAddress').get(function() {
  var fullAddress = this.address ? this.address + ' ' : ''
  fullAddress += this.city ? this.city + ' ' : ''
  fullAddress += this.state ? this.state + ' ' : ''
  fullAddress += this.zip ? this.zip : ''
  return fullAddress
})

EmployeeSchema.set('toJSON', {virtuals: true})

export default mongoose.model(modelTypes.EMPLOYEE, EmployeeSchema)
