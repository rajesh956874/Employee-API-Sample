
const employeeService = require('../services/employeeService');

async function getEmployees(req, res, next) {
  try {
    const search = String(req.query.search ?? '').trim();
    const startIndex = Number(req.query.startIndex ?? 0);
    const pageSize = Number(req.query.pageSize ?? 10);
    const sortBy = String(req.query.sortBy ?? 'EmployeeId');
    const sortOrder = String(req.query.sortOrder ?? 'asc').toLowerCase();
    // Validate pagination and search parameters
    if (
      !Number.isInteger(startIndex) ||
      startIndex < 0 ||
      !Number.isInteger(pageSize) ||
      pageSize < 1 ||
      pageSize > 100 ||
      search.length > 100
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid search, startIndex, or pageSize'
      });
    }

    const result = await employeeService.getEmployees({
      search,
      startIndex,
      pageSize,
      sortBy,
      sortOrder
    });

    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getEmployees };
