interface ProfileActionsProps {
  editMode: boolean;
  onSave: () => void;
  onCancel: () => void;
  onEdit: () => void;
}

export default function ProfileActions({
  editMode,
  onSave,
  onCancel,
  onEdit,
}: ProfileActionsProps) {
  return (
    <div className="flex justify-center space-x-3 mt-8">
      {editMode ? (
        <>
          <button onClick={onSave} className="bg-white text-green-600 hover:bg-green-600 hover:text-white px-5 h-8 w-16 py-2 rounded-lg shadow-md">
            Save
          </button>
          <button onClick={onCancel} className="bg-white text-gray-800 hover:bg-gray-800 hover:text-white px-5 h-8 w-16 py-2 rounded-lg shadow-md">
            Cancel
          </button>
        </>
      ) : (
        <button onClick={onEdit} className="bg-white text-blue-600 hover:bg-blue-600 hover:text-white px-5 h-8 w-16 py-2 rounded-lg shadow-md">
          Edit
        </button>
      )}
    </div>
  );
}
