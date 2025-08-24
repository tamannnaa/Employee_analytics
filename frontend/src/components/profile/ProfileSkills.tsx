
interface ProfileSkillsProps {
  skills: string[];
  editMode: boolean;
  onChange: (i: number, value: string) => void;
  onAdd: () => void;
  onRemove: (i: number) => void;
}

export default function ProfileSkills({
  skills,
  editMode,
  onChange,
  onAdd,
  onRemove,
}: ProfileSkillsProps) {
  return (
    <div className="space-y-2">
      <span className="font-medium text-gray-700">Skills:</span>
      {skills.map((skill, idx) => (
        <div key={idx} className="flex space-x-2">
          {editMode ? (
            <>
              <input
                type="text"
                value={skill}
                onChange={(e) => onChange(idx, e.target.value)}
                className="border border-gray-300 px-3 py-2 rounded flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                className="bg-red-500 text-white px-3 py-1 rounded"
                onClick={() => onRemove(idx)}
              >
                X
              </button>
            </>
          ) : (
            <span className="text-gray-800">{skill || "-"}</span>
          )}
        </div>
      ))}
      {editMode && (
        <button
          onClick={onAdd}
          className="bg-white text-blue-600 hover:bg-blue-600 hover:text-white w-20 px-3 py-2 rounded mt-2"
        >
          Add Skill
        </button>
      )}
    </div>
  );
}
