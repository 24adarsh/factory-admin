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
  date: string;
  multiplier: number;
};

/* ================= COMPONENT ================= */

export default function PayrollPage() {
  /* ================= STATE ================= */

  const [plants, setPlants] = useState<Plant[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);

  const [plantId, setPlantId] = useState("");
  const [month, setMonth] = useState("");

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    const loadData = async () => {
      try {
        const [plantRes, empRes, attRes] = await Promise.all([
          fetch("/api/plants"),
          fetch("/api/employees"),
          fetch("/api/attendance"),
        ]);

        setPlants(await plantRes.json());
        setEmployees(await empRes.json());

        const attData = await attRes.json();
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
        a.date.startsWith(month)
    );

  const getTotalShifts = (empId: string) =>
    getRecords(empId).length;

  const calculateSalary = (empId: string, daily: number) =>
    getRecords(empId).reduce(
      (total, r) => total + daily * r.multiplier,
      0
    );

  const totalPayroll = filteredEmployees.reduce(
    (sum, emp) => sum + calculateSalary(emp.employeeId, emp.dailySalary),
    0
  );

  const totalShifts = filteredEmployees.reduce(
    (sum, emp) => sum + getTotalShifts(emp.employeeId),
    0
  );

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Payroll</h2>

      {/* ===== FILTERS ===== */}
      <div className="bg-white p-4 rounded-xl shadow flex flex-col md:flex-row gap-4">
        <select
          value={plantId}
          onChange={(e) => setPlantId(e.target.value)}
          className="border p-2 rounded-md"
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
          className="border p-2 rounded-md"
        />
      </div>

      {/* ===== SUMMARY ===== */}
      {plantId && month && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-sm text-gray-500">Employees</p>
            <p className="text-2xl font-semibold">
              {filteredEmployees.length}
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-sm text-gray-500">Total Shifts</p>
            <p className="text-2xl font-semibold">{totalShifts}</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-sm text-gray-500">Total Payroll</p>
            <p className="text-2xl font-semibold">
              ₹{totalPayroll}
            </p>
          </div>
        </div>
      )}

      {/* ===== PAYROLL TABLE ===== */}
      {plantId && month && (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left">Employee</th>
                <th className="p-4 text-left">Total Shifts</th>
                <th className="p-4 text-left">Salary (₹)</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="p-6 text-center text-gray-500"
                  >
                    No employees found for this plant
                  </td>
                </tr>
              )}

              {filteredEmployees.map((emp) => (
                <tr key={emp.employeeId} className="border-t">
                  <td className="p-4 font-medium">{emp.name}</td>
                  <td className="p-4">
                    {getTotalShifts(emp.employeeId)}
                  </td>
                  <td className="p-4 font-semibold">
                    ₹{calculateSalary(emp.employeeId, emp.dailySalary)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ===== EMPTY STATE ===== */}
      {!plantId && (
        <div className="bg-white p-8 rounded-xl shadow text-center text-gray-500">
          Select a plant and month to view payroll
        </div>
      )}
    </div>
  );
}
