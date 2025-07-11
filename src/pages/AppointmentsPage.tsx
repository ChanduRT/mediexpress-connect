
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppointments } from "@/hooks/useAppointments";
import AppointmentsList from "@/components/appointments/AppointmentsList";
import AppointmentsLoading from "@/components/appointments/AppointmentsLoading";
import AppointmentsEmptyState from "@/components/appointments/AppointmentsEmptyState";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

const AppointmentsPage = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  
  const {
    appointments,
    loading,
    refreshing,
    handleManualRefresh,
    handleUpdateStatus
  } = useAppointments(activeTab);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-24">
        <Card>
          <CardHeader>
            <CardTitle>My Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs 
              defaultValue="all" 
              className="w-full"
              onValueChange={(value) => setActiveTab(value as 'all' | 'pending' | 'accepted' | 'rejected')}
            >
              <TabsList className="grid grid-cols-4 mb-8">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="accepted">Accepted</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab}>
                {loading ? (
                  <AppointmentsLoading />
                ) : appointments.length === 0 ? (
                  <AppointmentsEmptyState
                    activeTab={activeTab === 'all' ? 'pending' : activeTab}
                    onRefresh={handleManualRefresh}
                    refreshing={refreshing}
                  />
                ) : (
                  <>
                    <AppointmentsList 
                      appointments={appointments}
                      activeTab={activeTab === 'all' ? 'pending' : activeTab}
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
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppointmentsPage;
