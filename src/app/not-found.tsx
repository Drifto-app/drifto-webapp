"use client"

export default function NotFound() {

  return (
    <div className="min-h-[100dvh] bg-black flex items-center justify-center px-4">
      <div className={`text-center transition-all duration-700 opacity-100 translate-y-0`}>
        {/* Logo */}
        <div className="mb-12 flex justify-center">
          <img
            src="/logo-white.svg"
            alt="Drifto Logo"
            className="h-12 w-auto"
          />
        </div>

        {/* 404 Number */}
        <div className="relative mb-8">
          <h1 className="text-9xl font-bold text-white tracking-tight">
            404
          </h1>
          <div className="absolute inset-0 text-9xl font-bold text-blue-800 blur-xl opacity-50">
            404
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-4 mb-12">
          <h2 className="text-xl font-semibold text-white">
            Page Not Found
          </h2>
          <p className="text-gray-400 text-base  max-w-md mx-auto">
            {"Looks like you've drifted off course. The page you're looking for doesn't exist."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="/"
            className="px-8 py-3 bg-blue-800 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg shadow-blue-500/50"
          >
            Go Home
          </a>
          <button
            onClick={() => window.history.back()}
            className="px-8 py-3 bg-background text-foreground font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            Go Back
          </button>
        </div>

        {/* Decorative Element */}
        <div className="mt-16 flex justify-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-background rounded-full animate-pulse delay-75"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
        </div>
      </div>
    </div>
  );
}