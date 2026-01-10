"use client";

import { useEffect, useState } from "react";

type Plant = {
  plantId: string;
  name: string;
  location: string;
  createdAt: string;
};

export default function PlantsPage() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 Load plants from DynamoDB
  useEffect(() => {
    fetch("/api/plants")
      .then((res) => res.json())
      .then(setPlants)
      .catch(() => alert("Failed to load plants"));
  }, []);

  const addPlant = async () => {
    if (!name || !location) return;

    setLoading(true);

    const res = await fetch("/api/plants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, location }),
    });

    setLoading(false);

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Failed to save plant");
      return;
    }

    const saved = await res.json();
    setPlants((prev) => [...prev, saved]);

    setName("");
    setLocation("");
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Plants</h2>

      {/* Add Plant */}
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

      {/* Plants Table */}
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
