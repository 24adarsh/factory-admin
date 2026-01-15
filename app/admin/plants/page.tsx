"use client";

import { useEffect, useState } from "react";

/* ================= TYPES ================= */

type Plant = {
  plantId: string;
  name: string;
  location: string;
  createdAt: string;
};

export default function PlantsPage() {
  /* ================= STATE ================= */

  const [plants, setPlants] = useState<Plant[]>([]);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= LOAD PLANTS ================= */

  useEffect(() => {
    const loadPlants = async () => {
      try {
        const res = await fetch("/api/plants");
        const data = await res.json();

        setPlants(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load plants", err);
        alert("Failed to load plants");
      }
    };

    loadPlants();
  }, []);

  /* ================= ADD PLANT ================= */

  const addPlant = async () => {
    if (!name || !location) {
      alert("Fill all fields");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/plants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, location }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || "Failed to save plant");
        return;
      }

      setPlants((prev) => [...prev, data]);
      setName("");
      setLocation("");
    } catch (err) {
      console.error("Add plant error", err);
      alert("Failed to save plant");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Plants</h2>

      {/* ===== ADD PLANT ===== */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="font-medium mb-3">Add New Plant</h3>

        <div className="grid grid-cols-3 gap-3">
          <input
            placeholder="Plant Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 rounded"
          />

          <input
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="border p-2 rounded"
          />

          <button
            onClick={addPlant}
            disabled={loading}
            className="bg-gray-900 text-white rounded px-4"
          >
            {loading ? "Saving..." : "Add"}
          </button>
        </div>
      </div>

      {/* ===== PLANTS TABLE ===== */}
      <div className="bg-white rounded shadow">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3">Plant ID</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Location</th>
              <th className="text-left p-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {plants.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  No plants found
                </td>
              </tr>
            )}

            {plants.map((plant) => (
              <tr key={plant.plantId} className="border-t">
                <td className="p-3">{plant.plantId}</td>
                <td className="p-3">{plant.name}</td>
                <td className="p-3">{plant.location}</td>
                <td className="p-3">
                  {new Date(plant.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
