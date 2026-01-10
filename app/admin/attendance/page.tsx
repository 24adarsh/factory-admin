"use client";

import { useState } from "react";
export const runtime = "nodejs";

/* ================= TYPES ================= */

type Plant = {
  plantId: string;
  name: string;
};

type Employee = {
  employeeId: string;
  name: string;
  plantId: string;
  dailySalary: number; // for 12 hours
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

/* ================= SHIFT CONFIG ================= */

const SHIFTS = {
  DAY_HALF: { label: "Day Half (6 hrs)", multiplier: 0.5 },
  DAY: { label: "Day Full (12 hrs)", multiplier: 1 },
  NIGHT_HALF: { label: "Night Half (6 hrs)", multiplier: 0.5 },
  NIGHT: { label: "Night Full (12 hrs)", multiplier: 1 },
  DAY_NIGHT: { label: "Day + Night (24 hrs)", multiplier: 2 },
};

/* ================= TODAY DATE ================= */

const today = new Date().toISOString().split("T")[0];

export default function AttendancePage() {
  /* ================= TEMP DATA (will be API later) ================= */

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

  /* ================= FORM STATE ================= */

  const [plantId, setPlantId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [date, setDate] = useState(today);
  const [shiftType, setShiftType] =
    useState<Attendance["shiftType"]>("DAY");

  /* ================= TOAST ================= */

  const [showToast, setShowToast] = useState(false);

  /* ================= DERIVED ================= */

  const filteredEmployees = employees.filter(
    (e) => e.plantId === plantId
  );

  /* ================= ACTIONS ================= */

  const markAttendance = () => {
    if (!plantId || !employeeId) return;

    const record: Attendance = {
      id: Date.now().toString(),
      date,
      plantId,
      employeeId,
      shiftType,
      multiplier: SHIFTS[shiftType].multiplier,
    };

    setAttendance((prev) => [...prev, record]);

    // Success toast
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const getEmployeeName = (id: string) =>
    employees.find((e) => e.employeeId === id)?.name || "-";

  const getPlantName = (id: string) =>
    plants.find((p) => p.plantId === id)?.name || "-";

  /* ================= UI ================= */

  return (
    <div className="relative">
      <h2 className="text-2xl font-semibold mb-6">Attendance</h2>

      {/* ===== FORM ===== */}
      <div className="bg-white p-5 rounded-xl shadow mb-6">
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
              setShiftType(e.target.value as Attendance["shiftType"])
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
            className="bg-slate-900 text-white rounded px-4 hover:bg-slate-800 transition"
          >
            Save
          </button>
        </div>
      </div>

      {/* ===== TABLE ===== */}
      <div className="bg-white rounded-xl shadow">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Plant</th>
              <th className="p-3 text-left">Employee</th>
              <th className="p-3 text-left">Shift</th>
              <th className="p-3 text-left">Multiplier</th>
            </tr>
          </thead>
          <tbody>
            {attendance.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  No attendance marked yet
                </td>
              </tr>
            )}

            {attendance.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="p-3">{a.date}</td>
                <td className="p-3">{getPlantName(a.plantId)}</td>
                <td className="p-3">{getEmployeeName(a.employeeId)}</td>
                <td className="p-3">{SHIFTS[a.shiftType].label}</td>
                <td className="p-3">{a.multiplier}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== SUCCESS TOAST ===== */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="flex items-center gap-3 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg">
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
