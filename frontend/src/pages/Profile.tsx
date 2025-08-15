import { useEffect, useState } from "react";
import { getuser, updateProfile } from "../api/auth";

export default function Profile() {
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    getuser().then(setProfile).catch(console.error);
  }, []);

  const handleSave = async () => {
    await updateProfile(profile.name, profile.email);
    setEditMode(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Profile</h1>
      <div className="space-y-3">
        <input
          type="text"
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          readOnly={!editMode}
          className="border px-3 py-2"
        />
        <input
          type="email"
          value={profile.email}
          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          readOnly={!editMode}
          className="border px-3 py-2"
        />
      </div>
      <div className="mt-4">
        {editMode ? (
          <button
            className="bg-green-500 text-white px-3 py-2 rounded"
            onClick={handleSave}
          >
            Save
          </button>
        ) : (
          <button
            className="bg-blue-500 text-white px-3 py-2 rounded"
            onClick={() => setEditMode(true)}
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
}
