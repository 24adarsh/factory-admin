"use client";

import { useState } from "react";

type Plant = {
  plantId: string;
  name: string;
};

type Employee = {
  employeeId: string;
  name: string;
  plantId: string;
  dailySalary: number;
};

type Attendance = {
  date: string;
  plantId: string;
  employeeId: string;
  multiplier: number;
};

export default function PayrollPage() {
  // TEMP data (later from backend)
  const [plants] = useState<Plant[]>([
    { plantId: "P1", name: "Pune Plant" },
    { plantId: "P2", name: "Mumbai Plant" },
  ]);

  const [employees] = useState<Employee[]>([
    {
      employeeId: "E1",
      name: "Amit Patil",
      plantId: "P1",
      dailySalary: 1000,
    },
    {
      employeeId: "E2",
      name: "Rahul Sharma",
      plantId: "P2",
      dailySalary: 1200,
    },
  ]);

  const [attendance] = useState<Attendance[]>([
    {
      date: "2025-01-01",
      plantId: "P1",
      employeeId: "E1",
      multiplier: 1,
    },
    {
      date: "2025-01-02",
      plantId: "P1",
      employeeId: "E1",
      multiplier: 2,
    },
  ]);

  const [plantId, setPlantId] = useState("");
  const [month, setMonth] = useState("");

  const filteredEmployees = employees.filter(
    (e) => e.plantId === plantId
  );

  const calculateSalary = (employeeId: string, dailySalary: number) => {
    return attendance
      .filter(
        (a) =>
          a.employeeId === employeeId &&
          a.plantId === plantId &&
          a.date.startsWith(month)
      )
      .reduce(
        (total, record) =>
          total + dailySalary * record.multiplier,
        0
      );
  };

  const getTotalShifts = (employeeId: string) =>
    attendance.filter(
      (a) =>
        a.employeeId === employeeId &&
        a.plantId === plantId &&
        a.date.startsWith(month)
    ).length;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Payroll</h2>

      {/* Filters */}
      <div className="bg-white p-4 rounded shadow mb-6 flex gap-4">
        <select
          value={plantId}
          onChange={(e) => setPlantId(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Select Plant</option>
          {plants.map((p) => (
            <option key={p.plantId} value={p.plantId}>
              {p.name}
            </option>
          ))}
        </select>

        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      {/* Payroll Table */}
      {plantId && month && (
        <div className="bg-white rounded shadow">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Employee</th>
                <th className="p-3 text-left">Total Shifts</th>
                <th className="p-3 text-left">Salary (₹)</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp) => (
                <tr key={emp.employeeId} className="border-t">
                  <td className="p-3">{emp.name}</td>
                  <td className="p-3">
                    {getTotalShifts(emp.employeeId)}
                  </td>
                  <td className="p-3 font-medium">
                    ₹
                    {calculateSalary(
                      emp.employeeId,
                      emp.dailySalary
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
