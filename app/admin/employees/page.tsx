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
  createdAt: string;
};

export default function EmployeesPage() {
  /* ================= STATE ================= */

  const [plants, setPlants] = useState<Plant[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [name, setName] = useState("");
  const [plantId, setPlantId] = useState("");
  const [dailySalary, setDailySalary] = useState("");

  const [editingEmployeeId, setEditingEmployeeId] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    const loadData = async () => {
      try {
        const [plantRes, empRes] = await Promise.all([
          fetch("/api/plants"),
          fetch("/api/employees"),
        ]);

        const plantData = await plantRes.json();
        const empData = await empRes.json();

        setPlants(Array.isArray(plantData) ? plantData : []);
        setEmployees(Array.isArray(empData) ? empData : []);
      } catch (err) {
        console.error("Failed to load data", err);
        alert("Failed to load plants/employees");
      }
    };

    loadData();
  }, []);

  /* ================= ADD / UPDATE ================= */

  const saveEmployee = async () => {
    if (!name || !plantId || !dailySalary) {
      alert("Fill all fields");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        editingEmployeeId
          ? `/api/employees?employeeId=${editingEmployeeId}`
          : "/api/employees",
        {
          method: editingEmployeeId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            plantId,
            dailySalary: Number(dailySalary),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || "Failed to save employee");
        return;
      }

      if (editingEmployeeId) {
        setEmployees((prev) =>
          prev.map((e) =>
            e.employeeId === editingEmployeeId ? data : e
          )
        );
      } else {
        setEmployees((prev) => [...prev, data]);
      }

      resetForm();
    } catch (err) {
      console.error("Save employee error", err);
      alert("Failed to save employee");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */

  const deleteEmployee = async (employeeId: string) => {
    if (!confirm("Delete this employee?")) return;

    try {
      const res = await fetch(
        `/api/employees?employeeId=${employeeId}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        alert("Failed to delete employee");
        return;
      }

      setEmployees((prev) =>
        prev.filter((e) => e.employeeId !== employeeId)
      );
    } catch (err) {
      console.error("Delete employee error", err);
      alert("Failed to delete employee");
    }
  };

  /* ================= HELPERS ================= */

  const startEdit = (emp: Employee) => {
    setEditingEmployeeId(emp.employeeId);
    setName(emp.name);
    setPlantId(emp.plantId);
    setDailySalary(emp.dailySalary.toString());
  };

  const resetForm = () => {
    setEditingEmployeeId(null);
    setName("");
    setPlantId("");
    setDailySalary("");
  };

  const getPlantName = (id: string) =>
    plants.find((p) => p.plantId === id)?.name || "-";

  /* ================= UI ================= */

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Employees</h2>

      {/* ===== ADD / EDIT EMPLOYEE ===== */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="font-medium mb-3">
          {editingEmployeeId ? "Edit Employee" : "Add Employee"}
        </h3>

        <div className="grid grid-cols-5 gap-3">
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
            onClick={saveEmployee}
            disabled={loading}
            className="bg-gray-900 text-white rounded px-4"
          >
            {loading
              ? "Saving..."
              : editingEmployeeId
                ? "Update"
                : "Add"}
          </button>

          {editingEmployeeId && (
            <button
              onClick={resetForm}
              className="border rounded px-4"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* ===== EMPLOYEES TABLE ===== */}
      <div className="bg-white rounded shadow">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3">Employee ID</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Plant</th>
              <th className="text-left p-3">Daily Salary</th>
              <th className="text-left p-3">Created</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  No employees found
                </td>
              </tr>
            )}

            {employees.map((emp) => (
              <tr key={emp.employeeId} className="border-t">
                <td className="p-3">{emp.employeeId}</td>
                <td className="p-3">{emp.name}</td>
                <td className="p-3">{getPlantName(emp.plantId)}</td>
                <td className="p-3">₹{emp.dailySalary}</td>
                <td className="p-3">
                  {new Date(emp.createdAt).toLocaleString()}
                </td>
                <td className="p-3 space-x-3">
                  <button
                    onClick={() => startEdit(emp)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteEmployee(emp.employeeId)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
