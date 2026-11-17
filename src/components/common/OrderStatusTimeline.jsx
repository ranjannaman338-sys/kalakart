import React from 'react';
import { CheckCircle2, Clock, Truck, Package, XCircle, Home } from 'lucide-react';

const STEPS = [
  { key: 'ORDER_PLACED', label: 'Order Placed', icon: Clock },
  { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'PROCESSING', label: 'Crafting & Packing', icon: Package },
  { key: 'SHIPPED', label: 'Dispatched', icon: Truck },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: Home },
];

export function OrderStatusTimeline({ currentStatus = 'ORDER_PLACED', statusHistory = [] }) {
  const isCancelled = currentStatus === 'CANCELLED';

  if (isCancelled) {
    const cancelEntry = statusHistory.find((s) => s.status === 'CANCELLED');
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-5 my-4">
        <div className="flex items-center space-x-3 text-red-700">
          <XCircle className="w-6 h-6 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-sm">Order Cancelled</h4>
            <p className="text-xs text-red-600 mt-0.5">
              {cancelEntry?.note || 'This order was cancelled and inventory has been restored.'}
            </p>
            {cancelEntry?.timestamp && (
              <span className="text-[11px] text-red-500 block mt-1">
                {new Date(cancelEntry.timestamp).toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.key === currentStatus);
  const activeStepIdx = currentIndex >= 0 ? currentIndex : 0;

  return (
    <div className="py-6">
      {/* Horizontal Bar on Desktop */}
      <div className="relative">
        <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1 bg-cream-200 -translate-y-1/2 z-0" />
        <div
          className="hidden sm:block absolute top-1/2 left-0 h-1 bg-terracotta-500 -translate-y-1/2 z-0 transition-all duration-500"
          style={{
            width: `${(activeStepIdx / (STEPS.length - 1)) * 100}%`,
          }}
        />

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 relative z-10">
          {STEPS.map((step, idx) => {
            const isCompleted = idx <= activeStepIdx;
            const isCurrent = idx === activeStepIdx;
            const Icon = step.icon;
            const historyItem = statusHistory.find((h) => h.status === step.key);

            return (
              <div key={step.key} className="flex flex-col items-center text-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors mb-2 ${
                    isCurrent
                      ? 'bg-terracotta-500 text-white ring-4 ring-terracotta-100 shadow-md'
                      : isCompleted
                      ? 'bg-olive-600 text-white'
                      : 'bg-white border-2 border-cream-300 text-charcoal-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <span
                  className={`text-xs font-semibold leading-tight ${
                    isCurrent
                      ? 'text-terracotta-600'
                      : isCompleted
                      ? 'text-charcoal-800'
                      : 'text-charcoal-400'
                  }`}
                >
                  {step.label}
                </span>

                {historyItem?.timestamp && (
                  <span className="text-[10px] text-charcoal-400 mt-1">
                    {new Date(historyItem.timestamp).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* History notes list */}
      {statusHistory && statusHistory.length > 0 && (
        <div className="mt-8 pt-6 border-t border-cream-200">
          <h5 className="font-serif text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-3">
            Status Updates Log
          </h5>
          <div className="space-y-2">
            {[...statusHistory].reverse().map((entry, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between text-xs py-1.5 px-3 rounded-lg bg-cream-50/70 border border-cream-100"
              >
                <div>
                  <span className="font-semibold text-charcoal-800">
                    {entry.status.replace(/_/g, ' ')}
                  </span>
                  {entry.note && (
                    <span className="text-charcoal-600 ml-2">— {entry.note}</span>
                  )}
                </div>
                <span className="text-charcoal-400 text-[11px] flex-shrink-0 ml-4">
                  {new Date(entry.timestamp).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
