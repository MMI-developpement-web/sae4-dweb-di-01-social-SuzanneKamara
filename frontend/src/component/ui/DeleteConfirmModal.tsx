import React from 'react';
import { IoWarningOutline } from 'react-icons/io5';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title = 'Confirmation de suppression',
  message = 'Vous êtes sur le point de supprimer une publication',
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/35 z-40"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-white rounded-[10px] px-[10px] py-[20px] max-w-[280px] flex flex-col gap-[32px] items-center animate-in fade-in scale-95 duration-200">
          {/* Warning Icon */}
          <IoWarningOutline className="w-[48px] h-[48px]" style={{ color: '#F16F33' }} />

          {/* Text Content */}
          <div className="flex flex-col gap-[8px] items-center text-center">
            <h2 className="text-[14px] font-semibold text-gray-900">
              {title}
            </h2>
            <p className="text-[12px] text-gray-600">
              {message}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-[8px] w-full justify-center">
            {/* Cancel Button */}
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-[16px] py-[8px] rounded-[6px] bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 text-[12px] font-medium transition-colors"
            >
              Annuler
            </button>

            {/* Delete Button */}
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-[16px] py-[8px] rounded-[6px] bg-[#ea4098] hover:bg-[#d63a80] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[12px] font-medium transition-colors"
            >
              {isLoading ? 'Suppression...' : 'Supprimer'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeleteConfirmModal;
