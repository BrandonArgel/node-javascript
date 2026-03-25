import dbLocal from 'db-local'

const { Schema } = new dbLocal({ path: './databases' })

export default Schema
