import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Calendar, Users } from "lucide-react";
import AppointmentsTabs from "./appointments/AppointmentsTabs";
import AppointmentsList from "./appointments/AppointmentsList";
import AppointmentsLoading from "./appointments/AppointmentsLoading";
import AppointmentsEmptyState from "./appointments/AppointmentsEmptyState";
import { useAppointments } from "@/hooks/useAppointments";

interface DoctorAppointmentsProps {
  onAppointmentUpdate?: () => Promise<void>;
}

const DoctorAppointments = ({ onAppointmentUpdate }: DoctorAppointmentsProps) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'rejected'>('pending');
  
  const {
    appointments,
    loading,
    refreshing,
    handleManualRefresh,
    handleUpdateStatus
  } = useAppointments(activeTab, onAppointmentUpdate);

  const handleTabChange = (tab: 'pending' | 'accepted' | 'rejected') => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Appointments Dashboard</h1>
              <p className="text-gray-600">Manage your patient appointments efficiently</p>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              <span className="text-sm text-gray-600">Today: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center space-x-3 mb-4 sm:mb-0">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Patient Appointments</CardTitle>
                  <p className="text-blue-100 text-sm">Review and manage appointments</p>
                </div>
              </div>
              <AppointmentsTabs
                activeTab={activeTab}
                onTabChange={handleTabChange}
                loading={loading}
              />
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {loading ? (
              <AppointmentsLoading />
            ) : appointments.length === 0 ? (
              <AppointmentsEmptyState
                activeTab={activeTab}
                onRefresh={handleManualRefresh}
                refreshing={refreshing}
              />
            ) : (
              <>
                <AppointmentsList 
                  appointments={appointments}
                  activeTab={activeTab}
                  onUpdateStatus={handleUpdateStatus}
                />
                <div className="flex justify-center mt-8 pt-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={handleManualRefresh}
                    disabled={refreshing}
                    className="flex items-center px-6 py-2 hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? "Refreshing..." : "Refresh Appointments"}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DoctorAppointments;