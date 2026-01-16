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
  id: string;
  date: string;
  plantId: string;
  employeeId: string;
  shiftType:
    | "DAY_HALF"
    | "DAY_FULL"
    | "NIGHT_HALF"
    | "NIGHT_FULL"
    | "DAY_NIGHT";
  multiplier: number;
};

/* ================= SHIFT CONFIG ================= */

const SHIFTS = {
  DAY_HALF: { label: "Day Half (6 hrs)", multiplier: 0.5 },
  DAY_FULL: { label: "Day Full (12 hrs)", multiplier: 1 },
  NIGHT_HALF: { label: "Night Half (6 hrs)", multiplier: 0.5 },
  NIGHT_FULL: { label: "Night Full (12 hrs)", multiplier: 1 },
  DAY_NIGHT: { label: "Day + Night (24 hrs)", multiplier: 2 },
} as const;

/* ================= TODAY ================= */

const today = new Date().toISOString().split("T")[0];

export default function AttendancePage() {
  /* ================= STATE ================= */

  const [plants, setPlants] = useState<Plant[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);

  const [plantId, setPlantId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [date, setDate] = useState(today);
  const [shiftType, setShiftType] =
    useState<Attendance["shiftType"]>("DAY_FULL");

  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [editing, setEditing] = useState<Attendance | null>(null);
  const [editShift, setEditShift] =
    useState<Attendance["shiftType"]>("DAY_FULL");

  /* ================= LOAD MASTER DATA ================= */

  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const [plantRes, empRes] = await Promise.all([
          fetch("/api/plants"),
          fetch("/api/employees"),
        ]);

        setPlants(await plantRes.json());
        setEmployees(await empRes.json());
      } catch (err) {
        console.error("Failed to load master data", err);
      }
    };

    loadMasterData();
  }, []);

  /* ================= LOAD ATTENDANCE ================= */

  useEffect(() => {
    fetch("/api/attendance")
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data)) return;

        setAttendance(
          data.map((a: any) => ({
            id: a.attendanceId,
            date: a.date,
            plantId: a.plantId,
            employeeId: a.employeeId,
            shiftType: a.shiftType,
            multiplier: a.multiplier,
          }))
        );
      })
      .catch((err) => console.error("Attendance load error", err));
  }, []);

  /* ================= DERIVED ================= */

  const filteredEmployees = employees.filter(
    (e) => e.plantId === plantId
  );

  const getEmployeeName = (id: string) =>
    employees.find((e) => e.employeeId === id)?.name || "-";

  const getPlantName = (id: string) =>
    plants.find((p) => p.plantId === id)?.name || "-";

  /* ================= SAVE ATTENDANCE ================= */

  const markAttendance = async () => {
    if (!plantId || !employeeId || saving) return;

    setSaving(true);

    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plantId, employeeId, date, shiftType }),
    });

    setSaving(false);

    if (res.status === 409) {
      alert("Attendance already marked");
      return;
    }

    if (!res.ok) {
      alert("Failed to save attendance");
      return;
    }

    const saved = await res.json();

    setAttendance((prev) => [
      ...prev,
      {
        id: saved.attendanceId,
        date: saved.date,
        plantId: saved.plantId,
        employeeId: saved.employeeId,
        shiftType: saved.shiftType,
        multiplier: saved.multiplier,
      },
    ]);

    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  /* ================= DELETE ================= */

  const deleteAttendance = async (attendanceId: string) => {
    if (!confirm("Delete this attendance record?")) return;

    const res = await fetch(
      `/api/attendance?attendanceId=${attendanceId}`,
      { method: "DELETE" }
    );

    if (!res.ok) {
      alert("Failed to delete attendance");
      return;
    }

    setAttendance((prev) =>
      prev.filter((a) => a.id !== attendanceId)
    );
  };

  /* ================= UI ================= */

  return (
    <div className="relative">
      <h2 className="text-2xl font-semibold mb-6">Attendance</h2>

      {/* ===== FORM ===== */}
      <div className="bg-white p-5 rounded-xl shadow mb-6">
        <h3 className="font-medium mb-4">Mark Attendance</h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
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

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border p-2 rounded"
          />

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

          <button
            onClick={markAttendance}
            disabled={saving}
            className="bg-slate-900 text-white rounded px-4 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* ===== TABLE ===== */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Plant</th>
              <th className="p-3 text-left">Employee</th>
              <th className="p-3 text-left">Shift</th>
              <th className="p-3 text-left">Multiplier</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {attendance.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  No attendance yet
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
                <td className="p-3 space-x-3">
                  <button
                    className="text-indigo-600 hover:underline"
                    onClick={() => {
                      setEditing(a);
                      setEditShift(a.shiftType);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => deleteAttendance(a.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== EDIT MODAL ===== */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-[360px]">
            <h3 className="font-semibold mb-4">Edit Attendance</h3>

            <select
              value={editShift}
              onChange={(e) =>
                setEditShift(e.target.value as Attendance["shiftType"])
              }
              className="border p-2 w-full rounded mb-4"
            >
              {Object.entries(SHIFTS).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.label}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditing(null)}
                className="border px-4 py-2 rounded"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  const res = await fetch("/api/attendance", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      attendanceId: editing.id,
                      shiftType: editShift,
                    }),
                  });

                  if (!res.ok) {
                    alert("Update failed");
                    return;
                  }

                  setAttendance((prev) =>
                    prev.map((a) =>
                      a.id === editing.id
                        ? {
                            ...a,
                            shiftType: editShift,
                            multiplier: SHIFTS[editShift].multiplier,
                          }
                        : a
                    )
                  );
                  setEditing(null);
                }}
                className="bg-indigo-600 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-5 py-3 rounded-xl shadow">
          Attendance saved successfully
        </div>
      )}
    </div>
  );
}
