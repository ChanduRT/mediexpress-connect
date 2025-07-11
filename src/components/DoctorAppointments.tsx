
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
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
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Appointments</CardTitle>
            <AppointmentsTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
              loading={loading}
            />
          </div>
        </CardHeader>
        <CardContent>
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
              <div className="flex justify-center mt-4">
                <Button
                  variant="outline"
                  onClick={handleManualRefresh}
                  disabled={refreshing}
                  className="flex items-center"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? "Refreshing..." : "Refresh"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorAppointments;
