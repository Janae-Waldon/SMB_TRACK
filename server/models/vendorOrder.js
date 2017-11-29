import mongoose from 'mongoose'

import {modelTypes} from '../../common/constants'

const {Schema} = mongoose

const VendorOrderSchema = new Schema({
  vendorOrderID: {
    type: Number
  },
  orderingEmployee: {
    type: Number,
    ref: modelTypes.EMPLOYEE
  },
  vendor: {
    type: Number,
    ref: modelTypes.VENDOR
  },
  placementDate: {
    type: Date,
    default: Date.now
  },
  delivered: {
    type: Boolean,
    default: false
  },
  deliveryDate: {
    type: Date,
    default: null 
  }
})
export default mongoose.model(modelTypes.VENDORORDER, VendorOrderSchema)
