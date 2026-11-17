import React from 'react';

export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`${sizeClasses[size] || sizeClasses.md} border-terracotta-200 border-t-terracotta-600 rounded-full animate-spin`}
      />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-cream-200 p-4 animate-pulse">
      <div className="w-full h-56 bg-cream-100 rounded-lg mb-4" />
      <div className="h-4 bg-cream-200 rounded w-1/3 mb-2" />
      <div className="h-5 bg-cream-200 rounded w-4/5 mb-3" />
      <div className="h-4 bg-cream-100 rounded w-1/4 mb-4" />
      <div className="flex justify-between items-center pt-2 border-t border-cream-100">
        <div className="h-6 bg-cream-200 rounded w-1/3" />
        <div className="h-8 bg-cream-200 rounded-lg w-1/3" />
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, actionText, actionLink, onAction }) {
  return (
    <div className="text-center py-16 px-4 bg-white/60 rounded-2xl border border-cream-200/80 max-w-lg mx-auto">
      {Icon && (
        <div className="w-16 h-16 bg-cream-100 text-terracotta-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon className="w-8 h-8" />
        </div>
      )}
      <h3 className="font-serif text-2xl text-charcoal-900 font-semibold mb-2">{title}</h3>
      <p className="text-charcoal-600 mb-6 leading-relaxed text-sm md:text-base">{description}</p>
      {actionText && (
        actionLink ? (
          <a
            href={actionLink}
            className="inline-flex items-center justify-center px-6 py-2.5 bg-terracotta-500 hover:bg-terracotta-600 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            {actionText}
          </a>
        ) : onAction ? (
          <button
            onClick={onAction}
            className="inline-flex items-center justify-center px-6 py-2.5 bg-terracotta-500 hover:bg-terracotta-600 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            {actionText}
          </button>
        ) : null
      )}
    </div>
  );
}
