export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="text-center px-6">
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-600">CF</h1>
        </div>
        <h2 className="text-theme-xl font-bold text-gray-800 dark:text-white/90 mb-3">
          Under Maintenance
        </h2>
        <p className="text-theme-sm text-gray-500 dark:text-gray-400 max-w-md">
          We&apos;re performing scheduled maintenance and will be back shortly.
        </p>
      </div>
    </div>
  );
}
