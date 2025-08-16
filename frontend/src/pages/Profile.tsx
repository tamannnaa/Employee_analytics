import { useEffect, useState } from "react";
import { getuser, updateProfile } from "../api/auth";
import type { ProfileData } from "../types/auth";

export default function Profile() {
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    email: "",
    department: "",
    position: "",
    salary: 0,
    join_date: "",
    performance_score: 0,
    is_active: false,
    skills: [],
  });

  const [editMode, setEditMode] = useState(false);
  const [tempProfile, setTempProfile] = useState<ProfileData>({ ...profile });

 useEffect(() => {
  getuser()
    .then((data) => {
      console.log("Fetched user data:", data); // 👀 Check shape
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

  const handleSkillChange = (index: number, value: string) => {
    const newSkills = [...(tempProfile.skills || [])];
    newSkills[index] = value;
    setTempProfile({ ...tempProfile, skills: newSkills });
  };

  const addSkill = () => {
    setTempProfile({
      ...tempProfile,
      skills: [...(tempProfile.skills || []), ""],
    });
  };

  const removeSkill = (index: number) => {
    const newSkills = [...(tempProfile.skills || [])];
    newSkills.splice(index, 1);
    setTempProfile({ ...tempProfile, skills: newSkills });
  };

  const renderField = (label: string, value: any) => {
    let inputType = "text";
    if (label.toLowerCase() === "salary" || label.toLowerCase() === "performance_score")
      inputType = "number";
    if (label.toLowerCase() === "join_date") inputType = "date";

    const inputValue = inputType === "date" && value ? value.slice(0, 10) : value;

    return (
      <div className="flex justify-between  py-2">
        <span className="font-medium text-gray-700">
          {label.replace("_", " ")}
        </span>
        {editMode ? (
          <input
            type={inputType}
            value={inputValue || ""}
            onChange={(e) =>
              setTempProfile({
                ...tempProfile,
                [label.toLowerCase()]: e.target.value,
              })
            }
            className="border border-gray-300 px-3 py-2 rounded w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        ) : (
          <span className="text-gray-800">{inputValue?.toString() || "-"}</span>
        )}
      </div>
    );
  };

  return (
    <div className="w-400 h-220 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 flex justify-center items-center py-20 px-6">
      <div className="bg-white shadow-xl rounded-xl p-10 w-180 max-w-3xl border border-blue-100">
        {/* Header */}
        <br /><h1 className="text-3xl font-extrabold text-blue-700 mb-8 text-center">
          Profile
        </h1><br />

        {/* Name and Email emphasized */}
        <div className="space-y-8 mb-6">
          <div className="flex justify-between  py-3">
            <span className="text-xl font-bold text-gray-900">Name:</span>
            {editMode ? (
              <input
                type="text"
                value={tempProfile.name}
                onChange={(e) =>
                  setTempProfile({ ...tempProfile, name: e.target.value })
                }
                className="border border-gray-300 px-3 py-2 rounded w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            ) : (
              <span className="text-xl font-bold text-gray-800">{profile.name || "-"}</span>
            )}
          </div>

          <div className="flex justify-between  py-3">
            <span className="text-xl font-bold text-gray-900">Email:</span>
            {editMode ? (
              <input
                type="email"
                value={tempProfile.email}
                onChange={(e) =>
                  setTempProfile({ ...tempProfile, email: e.target.value })
                }
                className="border border-gray-300 px-3 py-2 rounded w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            ) : (
              <span className="text-xl font-bold text-gray-800">{profile.email || "-"}</span>
            )}
          </div>
        </div>

        {/* Other fields */}
        <div className="space-y-3 mt-6">
          {renderField("Department", editMode ? tempProfile.department : profile.department)}
          {renderField("Position", editMode ? tempProfile.position : profile.position)}
          {renderField("Salary", editMode ? tempProfile.salary : profile.salary)}
          {renderField("Join_date", editMode ? tempProfile.join_date : profile.join_date)}
          {renderField("Performance_score", editMode ? tempProfile.performance_score : profile.performance_score)}

          {editMode ? (
            <div className="flex items-center space-x-2 py-2">
              <span className="font-medium text-gray-700">Active:</span>
              <input
                type="checkbox"
                checked={tempProfile.is_active}
                onChange={(e) =>
                  setTempProfile({ ...tempProfile, is_active: e.target.checked })
                }
              />
            </div>
          ) : (
            <div className="flex justify-between  py-2">
              <span className="font-medium text-gray-700">Active:</span>
              <span className="text-gray-800">
                {profile.is_active ? "Yes" : "No"}
              </span>
            </div>
          )}

          {/* Skills */}
          <div className="space-y-2">
            <span className="font-medium text-gray-700">Skills:</span>
            {(editMode ? tempProfile.skills : profile.skills)?.map(
              (skill, idx) => (
                <div key={idx} className="flex space-x-2">
                  {editMode ? (
                    <>
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) =>
                          handleSkillChange(idx, e.target.value)
                        }
                        className="border border-gray-300 px-3 py-2 rounded flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded"
                        onClick={() => removeSkill(idx)}
                      >
                        X
                      </button>
                    </>
                  ) : (
                    <span className="text-gray-800">{skill || "-"}</span>
                  )}
                </div>
              )
            )}
            {editMode && (
              <button
                onClick={addSkill}
                className="bg-white text-blue-600 hover:bg-blue-600 hover:text-white w-20 px-3 py-2 rounded mt-2 "
              >
                Add Skill
              </button>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="space-x-3 mt-8 flex justify-center">
          {editMode ? (
            <>
              <button
                className="bg-white text-green-600 hover:bg-green-600 hover:text-white  px-5  h-8 w-16  py-2 rounded-lg shadow-md "
                onClick={handleSave}
              >
                Save
              </button>
              <button
                className="bg-white text-gray-800 hover:bg-gray-800 hover:text-white  px-5  h-8 w-16  py-2 rounded-lg shadow-md "
                onClick={handleCancel}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              className="bg-white text-blue-600 hover:bg-blue-600 hover:text-white  px-5 h-8 w-16 py-2 rounded-lg shadow-md "
              onClick={() => setEditMode(true)}
            >
              Edit
            </button>
          )}
        </div>
        <div>
                <a className="text-blue-600" href="/dashboard">Go to Home</a>
              </div>
        <br />
      </div>
    </div>
  );
}
