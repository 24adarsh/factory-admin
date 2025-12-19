"use client";

import { useState } from "react";

/* ---------- Types ---------- */
type Plant = {
  plantId: string;
  name: string;
};

type Employee = {
  employeeId: string;
  name: string;
  plantId: string;
  dailySalary: number; // salary for 12 hours
};

type Attendance = {
  id: string;
  date: string;
  plantId: string;
  employeeId: string;
  shiftType:
    | "DAY_HALF"
    | "DAY"
    | "NIGHT_HALF"
    | "NIGHT"
    | "DAY_NIGHT";
  multiplier: number;
};

/* ---------- Shift Configuration ---------- */
const SHIFTS = {
  DAY_HALF: { label: "Day Half Shift (6 hrs)", multiplier: 0.5 },
  DAY: { label: "Day Full Shift (12 hrs)", multiplier: 1 },
  NIGHT_HALF: { label: "Night Half Shift (6 hrs)", multiplier: 0.5 },
  NIGHT: { label: "Night Full Shift (12 hrs)", multiplier: 1 },
  DAY_NIGHT: { label: "Day + Night (24 hrs)", multiplier: 2 },
};

/* ---------- TODAY DATE ---------- */
const today = new Date().toISOString().split("T")[0];

export default function AttendancePage() {
  /* ---------- TEMP DATA ---------- */
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

  const [attendance, setAttendance] = useState<Attendance[]>([]);

  /* ---------- Form State ---------- */
  const [plantId, setPlantId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [date, setDate] = useState(today);
  const [shiftType, setShiftType] =
    useState<Attendance["shiftType"]>("DAY");

  /* ---------- Toast ---------- */
  const [showToast, setShowToast] = useState(false);

  /* ---------- Derived ---------- */
  const filteredEmployees = employees.filter(
    (e) => e.plantId === plantId
  );

  /* ---------- Actions ---------- */
  const markAttendance = () => {
    if (!plantId || !employeeId || !date) return;

    const record: Attendance = {
      id: Date.now().toString(),
      date,
      plantId,
      employeeId,
      shiftType,
      multiplier: SHIFTS[shiftType].multiplier,
    };

    setAttendance([...attendance, record]);

    // Success toast
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const getEmployeeName = (id: string) =>
    employees.find((e) => e.employeeId === id)?.name || "Unknown";

  const getPlantName = (id: string) =>
    plants.find((p) => p.plantId === id)?.name || "Unknown";

  /* ---------- UI ---------- */
  return (
    <div className="relative">
      <h2 className="text-2xl font-semibold mb-6">
        Attendance 
      </h2>

      {/* Attendance Form */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h3 className="font-medium mb-4">Mark Attendance</h3>

        <div className="grid grid-cols-5 gap-3">
          {/* Plant */}
          <select
            value={plantId}
            onChange={(e) => {
              setPlantId(e.target.value);
              setEmployeeId("");
            }}
            className="border p-2 rounded"
          >
            <option value="">Select Plant</option>
            {plants.map((p) => (
              <option key={p.plantId} value={p.plantId}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Employee */}
          <select
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">Select Employee</option>
            {filteredEmployees.map((e) => (
              <option key={e.employeeId} value={e.employeeId}>
                {e.name}
              </option>
            ))}
          </select>

          {/* Date */}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border p-2 rounded"
          />

          {/* Shift */}
          <select
            value={shiftType}
            onChange={(e) =>
              setShiftType(e.target.value as any)
            }
            className="border p-2 rounded"
          >
            {Object.entries(SHIFTS).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label}
              </option>
            ))}
          </select>

          {/* Save */}
          <button
            onClick={markAttendance}
            className="bg-gray-900 text-white rounded px-4 hover:bg-gray-800 transition"
          >
            Save
          </button>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl shadow">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Plant</th>
              <th className="p-3 text-left">Employee</th>
              <th className="p-3 text-left">Shift</th>
            </tr>
          </thead>
          <tbody>
            {attendance.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  No attendance marked yet
                </td>
              </tr>
            )}

            {attendance.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="p-3">{a.date}</td>
                <td className="p-3">{getPlantName(a.plantId)}</td>
                <td className="p-3">{getEmployeeName(a.employeeId)}</td>
                <td className="p-3 font-medium">
                  {SHIFTS[a.shiftType].label}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="flex items-center gap-3 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg animate-slide-in">
            <span className="text-lg">✅</span>
            <span className="font-medium">
              Attendance saved successfully
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
