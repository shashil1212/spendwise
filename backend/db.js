

const oracledb = require('oracledb')
const path     = require('path')


oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT

let pool

async function initialisePool() {

  if (process.env.TNS_ADMIN) {
    oracledb.initOracleClient({
      configDir: process.env.TNS_ADMIN
    })
    console.log('Oracle Wallet configured:', process.env.TNS_ADMIN)
  }

  pool = await oracledb.createPool({
    user:          process.env.DB_USER,
    password:      process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT,
    poolMin:       2,
    poolMax:       10,
    poolIncrement: 1,
  })

  console.log('Oracle connection pool created ✅')
  console.log('Connected as:', process.env.DB_USER)
}

async function getConnection() {
  return pool.getConnection()
}

module.exports = { initialisePool, getConnection }
