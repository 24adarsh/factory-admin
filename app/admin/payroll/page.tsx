"use client";

import { useEffect, useState } from "react";

/* ================= TYPES ================= */

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
  attendanceId: string;
  employeeId: string;
  plantId: string;
  date: string; // YYYY-MM-DD
  multiplier: number;
};

/* ================= COMPONENT ================= */

export default function PayrollPage() {
  /* ================= STATE ================= */

  const [plants, setPlants] = useState<Plant[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);

  const [plantId, setPlantId] = useState("");
  const [month, setMonth] = useState(""); // YYYY-MM

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    const loadData = async () => {
      try {
        const [plantRes, empRes, attRes] = await Promise.all([
          fetch("/api/plants"),
          fetch("/api/employees"),
          fetch("/api/attendance"),
        ]);

        const plantData = await plantRes.json();
        const empData = await empRes.json();
        const attData = await attRes.json();

        setPlants(Array.isArray(plantData) ? plantData : []);
        setEmployees(Array.isArray(empData) ? empData : []);

        // normalize attendance shape
        setAttendance(
          Array.isArray(attData)
            ? attData.map((a: any) => ({
              attendanceId: a.attendanceId,
              employeeId: a.employeeId,
              plantId: a.plantId,
              date: a.date,
              multiplier: a.multiplier,
            }))
            : []
        );
      } catch (err) {
        console.error("Payroll load error", err);
        alert("Failed to load payroll data");
      }
    };

    loadData();
  }, []);

  /* ================= DERIVED ================= */

  const filteredEmployees = employees.filter(
    (e) => e.plantId === plantId
  );

  const getRecords = (empId: string) =>
    attendance.filter(
      (a) =>
        a.employeeId === empId &&
        a.plantId === plantId &&
        a.date.startsWith(month) // YYYY-MM match
    );

  const getTotalShifts = (empId: string) =>
    getRecords(empId).length;

  const calculateSalary = (empId: string, daily: number) =>
    getRecords(empId).reduce(
      (total, r) => total + daily * r.multiplier,
      0
    );

  /* ================= UI ================= */

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Payroll</h2>

      {/* ===== FILTERS ===== */}
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

      {/* ===== PAYROLL TABLE ===== */}
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
              {filteredEmployees.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="p-4 text-center text-gray-500"
                  >
                    No employees found
                  </td>
                </tr>
              )}

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
