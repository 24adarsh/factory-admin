"use client";

import { useState } from "react";
export const runtime = "nodejs";

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

export default function EmployeesPage() {
  // TEMP plants (later from backend)
  const [plants] = useState<Plant[]>([
    { plantId: "P1", name: "Pune Plant" },
    { plantId: "P2", name: "Mumbai Plant" },
  ]);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [name, setName] = useState("");
  const [plantId, setPlantId] = useState("");
  const [dailySalary, setDailySalary] = useState("");

  const addEmployee = () => {
    if (!name || !plantId || !dailySalary) return;

    const newEmployee: Employee = {
      employeeId: Date.now().toString(),
      name,
      plantId,
      dailySalary: Number(dailySalary),
    };

    setEmployees([...employees, newEmployee]);
    setName("");
    setPlantId("");
    setDailySalary("");
  };

  const getPlantName = (id: string) =>
    plants.find((p) => p.plantId === id)?.name || "Unknown";

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Employees</h2>

      {/* Add Employee */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="font-medium mb-3">Add Employee</h3>

        <div className="grid grid-cols-4 gap-3">
          <input
            placeholder="Employee Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 rounded"
          />

          <select
            value={plantId}
            onChange={(e) => setPlantId(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">Select Plant</option>
            {plants.map((plant) => (
              <option key={plant.plantId} value={plant.plantId}>
                {plant.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Daily Salary"
            value={dailySalary}
            onChange={(e) => setDailySalary(e.target.value)}
            className="border p-2 rounded"
          />

          <button
            onClick={addEmployee}
            className="bg-gray-900 text-white rounded px-4"
          >
            Add
          </button>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded shadow">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3">Employee ID</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Plant</th>
              <th className="text-left p-3">Daily Salary</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  No employees added yet
                </td>
              </tr>
            )}

            {employees.map((emp) => (
              <tr key={emp.employeeId} className="border-t">
                <td className="p-3">{emp.employeeId}</td>
                <td className="p-3">{emp.name}</td>
                <td className="p-3">{getPlantName(emp.plantId)}</td>
                <td className="p-3">₹{emp.dailySalary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
