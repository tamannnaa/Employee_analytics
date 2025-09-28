import { useEffect, useState } from "react";
import { getuser, updateProfile } from "../../api/auth";
import type { ProfileData } from "../../types/auth";
import ProfileField from "../../components/profile/ProfileField";
import ProfileSkills from "../../components/profile/ProfileSkills";
import ProfileActions from "../../components/profile/ProfileActions";
import Navbar from "../../components/dashboard/Navbar";
import { logout } from "../../api/auth";

const emptyProfile: ProfileData = {
  name: "",
  email: "",
  department: "",
  position: "",
  salary: 0,
  join_date: "",
  performance_score: 0,
  is_active: false,
  skills: [],
};

export default function Profile() {
  const [profile, setProfile] = useState<ProfileData>(emptyProfile);
  const [editMode, setEditMode] = useState(false);
  const [tempProfile, setTempProfile] = useState<ProfileData>(emptyProfile);

  useEffect(() => {
    getuser()
      .then((data) => {
        const userData = data.user || data.data || data;
        if (!Array.isArray(userData.skills)) userData.skills = [];
        setProfile(userData);
        setTempProfile(userData);
      })
      .catch(console.error);
  }, []);

  const handleSave = async () => {
    await updateProfile(tempProfile);
    setProfile(tempProfile);
    setEditMode(false);
  };

  const handleCancel = () => {
    setTempProfile(profile);
    setEditMode(false);
  };

  const handlelogout = () => {
    logout();
  }
  return (
    <div>
      <Navbar/>
    <div className="w-500 h-220 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 flex justify-center items-center py-4 px-6">
      
      <div className="bg-white shadow-xl rounded-xl p-10 w-500 max-w-3xl border border-blue-100">
        <br />
        <h1 className="text-3xl font-extrabold text-blue-700 mb-8 text-center">
          Profile
        </h1><br />

        {/* Name + Email */}
        <ProfileField
          label="Name"
          value={tempProfile.name}
          editMode={editMode}
          onChange={(val) => setTempProfile({ ...tempProfile, name: val })}
        />
        <ProfileField
          label="Email"
          value={tempProfile.email}
          editMode={editMode}
          type="email"
          onChange={(val) => setTempProfile({ ...tempProfile, email: val })}
        />

        {/* Other fields */}
        <ProfileField
          label="Department"
          value={tempProfile.department}
          editMode={editMode}
          onChange={(val) => setTempProfile({ ...tempProfile, department: val })}
        />
        <ProfileField
          label="Position"
          value={tempProfile.position}
          editMode={editMode}
          onChange={(val) => setTempProfile({ ...tempProfile, position: val })}
        />
        <ProfileField
          label="Salary"
          type="number"
          value={tempProfile.salary}
          editMode={editMode}
          onChange={(val) => setTempProfile({ ...tempProfile, salary: Number(val) })}
        />
        <ProfileField
          label="Join_date"
          type="date"
          value={tempProfile.join_date}
          editMode={editMode}
          onChange={(val) => setTempProfile({ ...tempProfile, join_date: val })}
        />
        <ProfileField
          label="Performance_score"
          type="number"
          value={tempProfile.performance_score}
          editMode={editMode}
          onChange={(val) => setTempProfile({ ...tempProfile, performance_score: Number(val) })}
        />

        {/* Active Checkbox */}
        <div className="flex items-center space-x-2 py-2">
          <span className="font-medium text-gray-700">Active:</span>
          {editMode ? (
            <input
              type="checkbox"
              checked={tempProfile.is_active}
              onChange={(e) => setTempProfile({ ...tempProfile, is_active: e.target.checked })}
            />
          ) : (
            <span className="text-gray-800">{profile.is_active ? "Yes" : "No"}</span>
          )}
        </div>

        {/* Skills */}
        <ProfileSkills
          skills={tempProfile.skills || []}
          editMode={editMode}
          onChange={(i, val) =>
            setTempProfile({
              ...tempProfile,
              skills: tempProfile.skills.map((s, idx) => (idx === i ? val : s)),
            })
          }
          onAdd={() => setTempProfile({ ...tempProfile, skills: [...tempProfile.skills, ""] })}
          onRemove={(i) =>
            setTempProfile({
              ...tempProfile,
              skills: tempProfile.skills.filter((_, idx) => idx !== i),
            })
          }
        />

        {/* Buttons */}
        <ProfileActions
          editMode={editMode}
          onSave={handleSave}
          onCancel={handleCancel}
          onEdit={() => setEditMode(true)}
        />
        <br />
        <div className="text-center mt-4">
          <a className="text-blue-600" href="/dashboard">Go to Home</a>
        </div>
        <div className="text-center mt-4">
          <button className="text-blue-600" onClick={handlelogout}>Logout</button>
        </div>
        
      </div>
    </div>
    </div>
  );
}
