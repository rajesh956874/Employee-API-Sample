
const sql = require('mssql/msnodesqlv8');


const config = {
  connectionString:
    'Driver={ODBC Driver 18 for SQL Server};' +
    'Server=DESKTOP-77VD1TH;' +
    'Database=EmployeeDB;' +
    'Trusted_Connection=yes;' +
    'TrustServerCertificate=yes;'
};

async function connectDB() {
  const pool = await new sql.ConnectionPool(config).connect();
  console.log('SQL Server connected successfully');
  return pool;
}

module.exports = { connectDB, sql };
