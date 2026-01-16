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
  const [editingPlantId, setEditingPlantId] = useState<string | null>(null);

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

  /* ================= ADD / UPDATE ================= */

  const savePlant = async () => {
    if (!name || !location) {
      alert("Fill all fields");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        editingPlantId ? `/api/plants?id=${editingPlantId}` : "/api/plants",
        {
          method: editingPlantId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, location }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || "Operation failed");
        return;
      }

      if (editingPlantId) {
        setPlants((prev) =>
          prev.map((p) => (p.plantId === editingPlantId ? data : p))
        );
      } else {
        setPlants((prev) => [...prev, data]);
      }

      resetForm();
    } catch (err) {
      console.error("Save plant error", err);
      alert("Failed to save plant");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */

  const deletePlant = async (plantId: string) => {
    if (!confirm("Delete this plant?")) return;

    try {
      const res = await fetch(`/api/plants?id=${plantId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        alert("Failed to delete plant");
        return;
      }

      setPlants((prev) => prev.filter((p) => p.plantId !== plantId));
    } catch (err) {
      console.error("Delete error", err);
      alert("Failed to delete plant");
    }
  };

  /* ================= HELPERS ================= */

  const startEdit = (plant: Plant) => {
    setEditingPlantId(plant.plantId);
    setName(plant.name);
    setLocation(plant.location);
  };

  const resetForm = () => {
    setEditingPlantId(null);
    setName("");
    setLocation("");
  };

  /* ================= UI ================= */

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Plants</h2>

      {/* ===== ADD / EDIT PLANT ===== */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="font-medium mb-3">
          {editingPlantId ? "Edit Plant" : "Add New Plant"}
        </h3>

        <div className="grid grid-cols-4 gap-3">
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
            onClick={savePlant}
            disabled={loading}
            className="bg-gray-900 text-white rounded px-4"
          >
            {loading
              ? "Saving..."
              : editingPlantId
                ? "Update"
                : "Add"}
          </button>

          {editingPlantId && (
            <button
              onClick={resetForm}
              className="border rounded px-4"
            >
              Cancel
            </button>
          )}
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
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {plants.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
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
                <td className="p-3 space-x-2">
                  <button
                    onClick={() => startEdit(plant)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deletePlant(plant.plantId)}
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
