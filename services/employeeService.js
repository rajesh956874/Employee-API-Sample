
const { connectDB } = require('../db');

async function getEmployees({
  search,
  startIndex,
  pageSize,
  sortBy,
  sortOrder
}) {
  const pool = await connectDB();
  const searchText = `%${search}%`;

  // Only allow approved column names
  const allowedColumns = {
    EmployeeId: 'EmployeeId',
    EmployeeName: 'EmployeeName',
    Email: 'Email',
    Phone: 'Phone'
  };

  const sortColumn = allowedColumns[sortBy] || 'EmployeeId';
  const order = sortOrder === 'desc' ? 'DESC' : 'ASC';

  const result = await pool.request()
    .input('search', searchText)
    .input('startIndex', startIndex)
    .input('pageSize', pageSize)
    .query(`
      SELECT COUNT(*) AS total
      FROM dbo.Employee
      WHERE EmployeeName LIKE @search
         OR Email LIKE @search
         OR Phone LIKE @search;

      SELECT EmployeeId, EmployeeName, Email, Phone
      FROM dbo.Employee
      WHERE EmployeeName LIKE @search
         OR Email LIKE @search
         OR Phone LIKE @search
      ORDER BY ${sortColumn} ${order}
      OFFSET @startIndex ROWS
      FETCH NEXT @pageSize ROWS ONLY;
    `);

  const total = result.recordsets[0][0].total;
  const employees = result.recordsets[1];

  return {
    search,
    startIndex,
    pageSize,
    total,
    nextStartIndex:
      startIndex + employees.length < total
        ? startIndex + employees.length
        : null,
    sortBy: sortColumn,
    sortOrder: order.toLowerCase(),
    employees
  };
}

module.exports = { getEmployees };
