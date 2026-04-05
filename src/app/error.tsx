'use client';

import { IoWarningOutline } from 'react-icons/io5';

export default function Error({ error, reset }:  {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-[100dvh] bg-black flex items-center justify-center px-4">
      <div className="text-center animate-in fade-in duration-700">
        {/* Logo */}
        <div className="mb-12 flex justify-center">
          <img
            src="/logo-white.svg"
            alt="Drifto Logo"
            className="h-12 w-auto"
          />
        </div>

        {/* Error Icon */}
        <div className="relative mb-8 flex justify-center">
          <div className="relative">
            <IoWarningOutline size={100} className="text-blue-50" />
            <div className="absolute inset-0 blur-xl opacity-50">
              <IoWarningOutline size={100} className="text-blue-500" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-4 mb-12">
          <h2 className="text-xl font-semibold text-white">
            Something Went Wrong
          </h2>
          <p className="text-gray-400 text-base max-w-md mx-auto">
            {"We encountered an unexpected error. Don't worry, our team has been notified."}
          </p>
          {error?.message && (
            <p className="text-gray-500 text-sm max-w-md mx-auto font-mono bg-gray-900 px-4 py-2 rounded">
              {error.message}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => reset()}
            className="px-8 py-3 bg-blue-800 text-white font-medium rounded-lg  transition-colors duration-200 shadow-lg shadow-blue-500/50"
          >
            Try Again
          </button>
          <a
            href="/"
            className="px-8 py-3 bg-background text-foreground font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            Go Home
          </a>
        </div>

        {/* Decorative Element */}
        <div className="mt-16 flex justify-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-background rounded-full animate-pulse" style={{ animationDelay: '75ms' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
        </div>
      </div>
    </div>
  );
}