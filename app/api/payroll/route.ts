export const runtime = "nodejs";

import { NextResponse } from "next/server";
import db from "@/lib/dynamodb";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

const ATTENDANCE_TABLE = "Attendance";
const EMPLOYEES_TABLE = "Employees";

// Shift → multiplier (LOCKED RULE)
const SHIFT_MULTIPLIER: Record<string, number> = {
  DAY: 1.0,
  NIGHT: 1.0,
  HALF: 0.5,
};

export async function GET() {
  try {
    // 1️⃣ Fetch attendance
    const attendanceRes = await db.send(
      new ScanCommand({ TableName: ATTENDANCE_TABLE })
    );

    // 2️⃣ Fetch employees
    const employeesRes = await db.send(
      new ScanCommand({ TableName: EMPLOYEES_TABLE })
    );

    const attendance = attendanceRes.Items || [];
    const employees = employeesRes.Items || [];

    // 3️⃣ Map employees by ID
    const employeeMap: Record<string, any> = {};
    for (const emp of employees) {
      employeeMap[emp.employeeId] = emp;
    }

    // 4️⃣ Payroll calculation
    const payroll = attendance.map((record: any) => {
      const employee = employeeMap[record.employeeId];
      const dailySalary = employee?.dailySalary || 0;

      const multiplier =
        SHIFT_MULTIPLIER[record.shiftType] ?? 1.0;

      const pay = dailySalary * multiplier;

      return {
        employeeId: record.employeeId,
        employeeName: employee?.name || "Unknown",
        date: record.date,
        shiftType: record.shiftType,
        dailySalary,
        multiplier,
        pay,
      };
    });

    return NextResponse.json(payroll);
  } catch (error) {
    console.error("Payroll error:", error);
    return NextResponse.json(
      { error: "Failed to calculate payroll" },
      { status: 500 }
    );
  }
}
