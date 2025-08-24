import React from "react";

interface ProfileFieldProps {
  label: string;
  value: any;
  editMode: boolean;
  type?: string;
  onChange?: (val: any) => void;
}

export default function ProfileField({
  label,
  value,
  editMode,
  type = "text",
  onChange,
}: ProfileFieldProps) {
  const inputValue = type === "date" && value ? value.slice(0, 10) : value;

  return (
    <div className="flex justify-between py-2">
      <span className="font-medium text-gray-700">
        {label.replace("_", " ")}
      </span>
      {editMode ? (
        <input
          type={type}
          value={inputValue || ""}
          onChange={(e) => onChange?.(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      ) : (
        <span className="text-gray-800">{inputValue?.toString() || "-"}</span>
      )}
    </div>
  );
}
