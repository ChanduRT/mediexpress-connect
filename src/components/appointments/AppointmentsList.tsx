
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import AppointmentStatusBadge from "./AppointmentStatusBadge";
import AppointmentActions from "./AppointmentActions";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Appointment {
  id: string;
  patientName: string;
  contact: string;
  preferred_time: string | null;
  notes: string | null;
  status: string;
}

interface AppointmentsListProps {
  appointments: Appointment[];
  activeTab: 'pending' | 'accepted' | 'rejected' | 'all';
  onUpdateStatus: (id: string, status: 'accepted' | 'rejected') => Promise<void>;
}

const AppointmentsList = ({ appointments, activeTab, onUpdateStatus }: AppointmentsListProps) => {
  const [isDoctor, setIsDoctor] = useState(false);
  const { toast } = useToast();

  // Check if current user is a doctor
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const metadata = user.user_metadata || {};
          setIsDoctor(metadata.role === 'doctor');
        }
      } catch (error) {
        console.error("Error checking user role:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to verify user permissions."
        });
      }
    };
    
    checkUserRole();
  }, [toast]);

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Preferred Time</TableHead>
            <TableHead>Notes</TableHead>
            {(activeTab === 'pending' && isDoctor) && <TableHead className="text-right">Actions</TableHead>}
            {(activeTab !== 'pending' || !isDoctor) && <TableHead>Status</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={activeTab === 'pending' && isDoctor ? 5 : 5} className="text-center py-8 text-gray-500">
                No {activeTab} appointments found
              </TableCell>
            </TableRow>
          ) : (
            appointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell>{appointment.patientName}</TableCell>
                <TableCell>{appointment.contact}</TableCell>
                <TableCell>{appointment.preferred_time || 'Not specified'}</TableCell>
                <TableCell>{appointment.notes || '-'}</TableCell>
                {(activeTab === 'pending' && isDoctor) ? (
                  <TableCell className="text-right">
                    <AppointmentActions 
                      appointmentId={appointment.id}
                      onUpdateStatus={onUpdateStatus}
                    />
                  </TableCell>
                ) : (
                  <TableCell>
                    <AppointmentStatusBadge status={appointment.status} />
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AppointmentsList;
