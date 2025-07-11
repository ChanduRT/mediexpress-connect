
const AppointmentsLoading = () => {
  return (
    <div className="text-center py-6">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className="mt-2 text-sm text-gray-500">Loading appointments...</p>
    </div>
  );
};

export default AppointmentsLoading;
