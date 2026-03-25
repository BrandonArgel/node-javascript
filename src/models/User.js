import Schema from '../config/db.js'

const ModelName = 'User'
const BaseModel = {
  _id: { type: String, required: true },
  email: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true }
}

export const User = Schema(ModelName, BaseModel)
