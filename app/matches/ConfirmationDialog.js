import React from 'react';

const ConfirmationDialog = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-75 z-50">
      <div className="bg-white rounded-3xl p-4 w-80 relative">
        <div className="text-center">
          <p className="mt-2 text-sm">{message}</p>
          <div className="flex justify-between mt-4 space-x-4">
            <button
              className="bg-red-500 text-white py-2 px-4 rounded"
              onClick={onConfirm}
            >
              Confirm
            </button>
            <button
              className="bg-gray-500 text-white py-2 px-4 rounded"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
