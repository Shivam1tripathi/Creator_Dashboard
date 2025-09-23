// components/ReportModal.jsx
import { useState } from "react";

const ReportModal = ({ isOpen, onClose, onSubmit }) => {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!reason) return alert("Please select a reason");
    onSubmit(reason);
    setReason("");
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-80 p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Report Post
        </h2>

        <div className="space-y-2">
          {["Spam", "Inappropriate Content", "Harassment", "Other"].map(
            (option) => (
              <label
                key={option}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="reason"
                  value={option}
                  checked={reason === option}
                  onChange={(e) => setReason(e.target.value)}
                  className="cursor-pointer"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            )
          )}
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-sm"
          >
            Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
