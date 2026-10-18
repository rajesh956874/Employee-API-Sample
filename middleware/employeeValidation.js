
function validateEmployee(req, res, next) {
  const { EmployeeName, Email, Phone } = req.body;


  const allowedSortColumns = [
  'EmployeeId',
  'EmployeeName',
  'Email',
  'Phone'
];

if (
  !allowedSortColumns.includes(sortBy) ||
  !['asc', 'desc'].includes(sortOrder)
) {
  return res.status(400).json({
    success: false,
    message: 'Invalid sorting parameters'
  });
}

  // Check required fields
  if (!EmployeeName || !Email || !Phone) {
    return res.status(400).json({
      message: 'EmployeeName, Email and Phone are required'
    });
  }

  if (!Number.isInteger(employeeId) || employeeId <= 0) {
    return res.status(400).json({
      message: 'Invalid Employee ID'
    });
  }

  // Validate name
  if (typeof EmployeeName !== 'string' ||
      EmployeeName.trim().length < 2) {
    return res.status(400).json({
      message: 'Employee name must contain at least 2 characters'
    });
  }

  // Validate email
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (typeof Email !== 'string' ||
      !emailPattern.test(Email)) {
    return res.status(400).json({
      message: 'Please enter a valid email address'
    });
  }

  // Validate phone: 10 digits
  if (!/^\d{10}$/.test(String(Phone))) {
    return res.status(400).json({
      message: 'Phone must contain exactly 10 digits'
    });
  }

  // All validations passed
  next();
}

module.exports = validateEmployee;
