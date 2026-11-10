require('dotenv').config();
const jwt = require('jsonwebtoken');
const express = require('express');
const cors = require('cors');
// const { connectDB } = require('./db');
const validateEmployee = require('./middleware/employeeValidation');
const errorHandling = require('./middleware/errorHandling');
const authMiddleware = require('./middleware/authMiddleware')
const employeeRoutes = require('./routes/employeeRoutes');
const upload = require('./middleware/uploadMiddleware');
// const sql = require('mssql');
const ExcelJS = require('exceljs');
const { connectDB, sql } = require('./db');

const app = express();

app.use(cors());
app.use(express.json());


app.use('/api/employee', employeeRoutes);



app.post(
  '/api/upload',
  authMiddleware,
  upload.single('photo'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Please select an image'
        });
      }

      const employeeId = Number(req.body.employeeId);

      if (!Number.isInteger(employeeId) || employeeId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid employeeId'
        });
      }

      const pool = await connectDB();

      const result = await pool.request()
        .input('EmployeeId', sql.Int, employeeId)
        .input('FileName', sql.NVarChar(255), req.file.filename)
        .input(
          'FilePath',
          sql.NVarChar(500),
          `uploads/${req.file.filename}`
        )
        .input('ContentType', sql.NVarChar(100), req.file.mimetype)
        .input('FileSize', sql.BigInt, req.file.size)
        .query(`
          INSERT INTO dbo.EmployeeFiles
          (EmployeeId, FileName, FilePath, ContentType, FileSize)
          OUTPUT INSERTED.FileId, INSERTED.EmployeeId,
                 INSERTED.FileName, INSERTED.FilePath,
                 INSERTED.ContentType, INSERTED.FileSize,
                 INSERTED.UploadedAt
          VALUES
          (@EmployeeId, @FileName, @FilePath, @ContentType, @FileSize)
        `);

      return res.status(201).json({
        success: true,
        message: 'File uploaded and saved to database',
        file: result.recordset[0]
      });
    } catch (error) {
      next(error);
    }
  }
);


app.get('/api/employees/export/excel', authMiddleware, async (req, res, next) => {
  try {
    const pool = await connectDB();

    const result = await pool.request().query(`
      SELECT EmployeeId, EmployeeName, Email, Phone
      FROM dbo.Employee
      ORDER BY EmployeeId
    `);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Employees');

    worksheet.columns = [
      { header: 'Employee ID', key: 'EmployeeId', width: 15 },
      { header: 'Employee Name', key: 'EmployeeName', width: 25 },
      { header: 'Email', key: 'Email', width: 35 },
      { header: 'Phone', key: 'Phone', width: 18 }
    ];

    worksheet.addRows(result.recordset);
    worksheet.getRow(1).font = { bold: true };

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    res.setHeader(
      'Content-Disposition',
      'attachment; filename="employees.xlsx"'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
});



app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (
    username !== 'rajesh' ||
    password !== 'demo-password'
  ) {
    return res.status(401).json({
      message: 'Invalid username or password'
    });
  }

  const token = jwt.sign(
    { username: 'rajesh' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return res.status(200).json({
    message: 'Login successful',
    token: token
  });
});
// Custom middleware
app.use((req, res, next) => {
  console.log(
    `${new Date().toISOString()} | ${req.method} | ${req.url}`
  );

  next();
});
// Test the API without a database
app.get('/', (req, res) => {
  res.send('Employee Sample API is running');
});

// Test SQL Server connection


app.get('/api/employee',async (req,res,next) => {
 try {
    const pool = await connectDB();
    const result = await pool.request().query(
        'Select *from dbo.Employee'
    )
    res.json(result.recordset)
 } catch (error) {
    next(error)
    // console.log("'Error fetching employees:', error.message")
    // res.status(500).json({
    //      message: 'Failed to fetch employees',
    //   error: error.message
    // })
 }
});


app.put('/api/employee/:id', validateEmployee, async (req, res,next) => {
  try {
    const employeeId = Number(req.params.id);
    const { EmployeeName, Email, Phone } = req.body;

    if (!Number.isInteger(employeeId) || employeeId <= 0) {
      return res.status(400).json({
        message: 'Invalid Employee ID'
      });
    }

    if (!EmployeeName || !Email || !Phone) {
      return res.status(400).json({
        message: 'EmployeeName, Email and Phone are required'
      });
    }

    const pool = await connectDB();

    const result = await pool.request()
      .input('id', employeeId)
      .input('name', EmployeeName)
      .input('email', Email)
      .input('phone', Phone)
      .query(`
        UPDATE dbo.Employee
        SET EmployeeName = @name,
            Email = @email,
            Phone = @phone
        WHERE EmployeeId = @id;

        SELECT @@ROWCOUNT AS RowsAffected;
      `);

    if (result.recordsets[0][0].RowsAffected === 0) {
      return res.status(404).json({
        message: 'Employee not found'
      });
    }

    return res.status(200).json({
      message: 'Employee updated successfully'
    });

  } catch (error) {
    next(error)
    // console.error('Update employee error:', error.message);

    // return res.status(500).json({
    //   message: 'Failed to update employee',
    //   error: error.message
    // });
  }
});


app.get('/api/employee/:id', async (req, res,next)=>{

    
    try {
        const employeeId =Number(req.params.id);

        if(!Number.isInteger(employeeId) || employeeId <= 0){
          return res.status(400).json({
            message:'Invalid Employee ID.'
          })
        }
        
        const pool = await connectDB();
        const result =await pool.request()
                       .input('id',employeeId)
                       .query('Select * from dbo.Employee where EmployeeId = @id')
        if((await result).recordset.length === 0){
            return res.status(404).json({
                message: 'Employee not found'
            })
        }  
        res.status(200).json(result.recordset[0])        
    } catch (error) {
       return next(error)
    //     console.error('Get employee by ID error:', error);

    // res.status(500).json({
    //   message: 'Failed to retrieve employee'
    // });
    // next(error)
  
    }
})

app.get('/api/test-error', (req, res, next) => {
  next(new Error('Testing centralized error handling'));
});

app.use((req, res) => {
  res.status(404).json({
    message: 'API route not found'
  });
});


app.use(errorHandling);
// app.listen(3001, () => {
//   console.log('Employee Sample API running on port 3001');
// });
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Employee Sample API running on port ${PORT}`);
});