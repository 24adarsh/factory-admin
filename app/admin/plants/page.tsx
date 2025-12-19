"use client";

import { useState } from "react";

type Plant = {
  plantId: string;
  name: string;
  location: string;
};

export default function PlantsPage() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");

  const addPlant = () => {
    if (!name || !location) return;

    const newPlant: Plant = {
      plantId: Date.now().toString(),
      name,
      location,
    };

    setPlants([...plants, newPlant]);
    setName("");
    setLocation("");
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Plants</h2>

      {/* Add Plant Form */}
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
            className="bg-gray-900 text-white rounded px-4"
          >
            Add
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
            </tr>
          </thead>
          <tbody>
            {plants.length === 0 && (
              <tr>
                <td colSpan={3} className="p-4 text-center text-gray-500">
                  No plants added yet
                </td>
              </tr>
            )}

            {plants.map((plant) => (
              <tr key={plant.plantId} className="border-t">
                <td className="p-3">{plant.plantId}</td>
                <td className="p-3">{plant.name}</td>
                <td className="p-3">{plant.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
