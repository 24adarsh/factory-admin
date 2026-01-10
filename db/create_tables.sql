-- This file has been deprecated as SQL integration has been removed.
-- The application now uses DynamoDB for all data storage.
-- Please refer to lib/dynamodb.ts for database operations.


-- Attendance records
CREATE TABLE IF NOT EXISTS attendance (
  attendanceId VARCHAR(64) PRIMARY KEY,
  employeeId VARCHAR(64) NOT NULL,
  date DATE NOT NULL,
  status ENUM('present','absent','leave','holiday') DEFAULT 'present',
  checkIn DATETIME,
  checkOut DATETIME,
  hours DECIMAL(5,2),
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employeeId) REFERENCES employees(employeeId) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance(employeeId, date);

-- Payroll records
CREATE TABLE IF NOT EXISTS payroll (
  payrollId VARCHAR(64) PRIMARY KEY,
  employeeId VARCHAR(64) NOT NULL,
  periodStart DATE NOT NULL,
  periodEnd DATE NOT NULL,
  gross DECIMAL(12,2) NOT NULL,
  deductions DECIMAL(12,2) DEFAULT 0,
  net DECIMAL(12,2) NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employeeId) REFERENCES employees(employeeId) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_payroll_employee_period ON payroll(employeeId, periodStart, periodEnd);

-- Users (simple auth table; adapt if using next-auth)
CREATE TABLE IF NOT EXISTS users (
  userId VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  passwordHash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Example seed (uncomment and edit values to run)
-- INSERT INTO plants (plantId, name, location) VALUES ('PLANT#1','Main Plant','Pune');
-- INSERT INTO employees (employeeId, name, plantId, dailySalary, createdAt) VALUES ('EMP#1','Alice','PLANT#1',100,'2026-01-10 00:00:00');
