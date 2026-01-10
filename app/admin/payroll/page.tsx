"use client";

import { useEffect, useState } from "react";

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
  employeeId: string;
  plantId: string;
  date: string;
  multiplier: number;
};

export default function PayrollPage() {
  const [plants] = useState<Plant[]>([
    { plantId: "P1", name: "Pune Plant" },
    { plantId: "P2", name: "Mumbai Plant" },
  ]);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [plantId, setPlantId] = useState("");
  const [month, setMonth] = useState("");

  // load real data
  useEffect(() => {
    fetch("/api/employees").then(r => r.json()).then(setEmployees);
    fetch("/api/attendance").then(r => r.json()).then(setAttendance);
  }, []);

  const filteredEmployees = employees.filter(e => e.plantId === plantId);

  const getRecords = (empId: string) =>
    attendance.filter(
      a =>
        a.employeeId === empId &&
        a.plantId === plantId &&
        a.date.startsWith(month)
    );

  const getTotalShifts = (empId: string) =>
    getRecords(empId).length;

  const calculateSalary = (empId: string, daily: number) =>
    getRecords(empId).reduce(
      (total, r) => total + daily * r.multiplier,
      0
    );

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Payroll</h2>

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
                    ₹{calculateSalary(emp.employeeId, emp.dailySalary)}
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
