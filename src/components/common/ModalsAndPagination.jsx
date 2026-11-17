import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export function ConfirmationModal({
  isOpen,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  const btnStyles =
    confirmVariant === 'danger'
      ? 'bg-red-600 hover:bg-red-700 text-white'
      : 'bg-terracotta-500 hover:bg-terracotta-600 text-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-cream-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-charcoal-900">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-charcoal-400 hover:text-charcoal-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-charcoal-600 text-sm mb-6 leading-relaxed">{message}</p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-cream-300 rounded-lg text-charcoal-700 hover:bg-cream-50 font-medium text-sm transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${btnStyles}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center space-x-2 my-8">
      <button
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-3.5 py-1.5 rounded-lg border border-cream-300 text-sm font-medium text-charcoal-700 hover:bg-cream-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Previous
      </button>

      <div className="flex space-x-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
              currentPage === page
                ? 'bg-terracotta-500 text-white shadow-sm'
                : 'text-charcoal-700 hover:bg-cream-100 border border-cream-200'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-3.5 py-1.5 rounded-lg border border-cream-300 text-sm font-medium text-charcoal-700 hover:bg-cream-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Next
      </button>
    </div>
  );
}
