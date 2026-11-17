'use client';

import dynamic from 'next/dynamic';

const App = dynamic(
  () => import('@/src/App').then((mod) => mod.App),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-ivory">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-terracotta-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-charcoal-600">Loading KalaKart...</span>
        </div>
      </div>
    ),
  }
);

export default function ClientApp() {
  return <App />;
}
