
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Button from './Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Elimina",
  cancelText = "Annulla"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-brand-blue rounded-lg shadow-2xl w-full max-w-md border border-gray-700 transform transition-all scale-100">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-red-500">
                <div className="bg-red-500/20 p-2 rounded-full mr-3">
                    <AlertTriangle size={24} />
                </div>
                <h3 className="text-xl font-bold text-brand-light">{title}</h3>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>
          
          <p className="text-gray-300 mb-8 leading-relaxed">
            {message}
          </p>
          
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={onClose}>
              {cancelText}
            </Button>
            <Button 
                variant="danger" 
                onClick={() => {
                    onConfirm();
                    onClose();
                }}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
