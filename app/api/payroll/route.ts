export const runtime = "nodejs";

import { NextResponse } from "next/server";
import db from "@/lib/dynamodb";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

const ATTENDANCE_TABLE = "Attendance";
const EMPLOYEES_TABLE = "Employees";

/* ===============================
   GET /api/payroll?plantId=&month=
   month = YYYY-MM
================================ */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const plantId = searchParams.get("plantId");
    const month = searchParams.get("month"); // YYYY-MM

    if (!plantId || !month) {
      return NextResponse.json(
        { error: "plantId and month required" },
        { status: 400 }
      );
    }

    /* 1️⃣ Load attendance */
    const attendanceRes = await db.send(
      new ScanCommand({
        TableName: "Attendance",
        FilterExpression:
          "plantId = :p AND begins_with(#d, :m)",
        ExpressionAttributeNames: {
          "#d": "date",
        },
        ExpressionAttributeValues: {
          ":p": plantId,
          ":m": month,
        },
      })
    );

    /* 2️⃣ Load employees */
    const employeesRes = await db.send(
      new ScanCommand({
        TableName: "Employees",
        FilterExpression: "plantId = :p",
        ExpressionAttributeValues: {
          ":p": plantId,
        },
      })
    );

    const attendance = attendanceRes.Items ?? [];
    const employees = employeesRes.Items ?? [];

    /* 3️⃣ Employee map */
    const employeeMap: Record<string, any> = {};
    for (const emp of employees) {
      employeeMap[emp.employeeId] = emp;
    }

    /* 4️⃣ Group payroll by employee */
    const payrollMap: Record<string, any> = {};

    for (const record of attendance) {
      const emp = employeeMap[record.employeeId];
      if (!emp) continue;

      if (!payrollMap[record.employeeId]) {
        payrollMap[record.employeeId] = {
          employeeId: record.employeeId,
          employeeName: emp.name,
          dailySalary: emp.dailySalary,
          totalShifts: 0,
          totalAmount: 0,
        };
      }

      payrollMap[record.employeeId].totalShifts += 1;
      payrollMap[record.employeeId].totalAmount +=
        emp.dailySalary * record.multiplier;
    }

    /* 5️⃣ Return payroll array */
    return NextResponse.json(
      Object.values(payrollMap)
    );
  } catch (error) {
    console.error("Payroll GET error:", error);
    return NextResponse.json(
      { error: "Failed to calculate payroll" },
      { status: 500 }
    );
  }
}
