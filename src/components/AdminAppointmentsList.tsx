
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Check, X, RefreshCw } from "lucide-react";

// Define interface for appointment data with details
interface AppointmentWithDetails {
  id: string;
  patient_id: string;
  doctor_id: string | null;
  contact: string;
  preferred_time: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  patient_email?: string | null;
  doctor_email?: string | null;
}

const AdminAppointmentsList = () => {
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAppointments();
    
    // Set up real-time listener for appointments
    const channel = supabase
      .channel('admin-appointments-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'appointments' },
        () => {
          console.log('Appointment change detected - refreshing');
          fetchAppointments(false);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAppointments = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else if (!refreshing) {
        setRefreshing(true);
      }
      
      // Get all appointments
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      console.log("Fetched appointments for admin:", data);
      
      if (data) {
        // Process the appointments to get patient and doctor emails separately
        const processedAppointments = await Promise.all(data.map(async (appointment) => {
          let patientEmail = null;
          let doctorEmail = null;
          
          // Get patient email
          if (appointment.patient_id) {
            const { data: userData } = await supabase.auth.admin.getUserById(appointment.patient_id);
            patientEmail = userData?.user?.email || null;
          }
          
          // Get doctor email if assigned
          if (appointment.doctor_id) {
            const { data: doctorData } = await supabase.auth.admin.getUserById(appointment.doctor_id);
            doctorEmail = doctorData?.user?.email || null;
          }
          
          return {
            ...appointment,
            patient_email: patientEmail,
            doctor_email: doctorEmail
          };
        }));
        
        setAppointments(processedAppointments);
      }
    } catch (error: any) {
      console.error("Error fetching appointments:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load appointments data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
    
    toast({
      title: "Refreshing data",
      description: "Getting the latest appointment information",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': 
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </Badge>
        );
      case 'accepted':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            <Check className="w-3 h-3 mr-1" /> Accepted
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
            <X className="w-3 h-3 mr-1" /> Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            {status}
          </Badge>
        );
    }
  };

  // Function to get name from email or ID
  const getNameFromEmail = (email: string | null | undefined) => {
    if (!email) return 'Unknown';
    return email.split('@')[0];
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold flex items-center">
            <Calendar className="mr-2 h-5 w-5" /> Appointments
          </h3>
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
        
        {loading ? (
          <div className="py-8 flex justify-center items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
            <span className="ml-3">Loading appointments...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Preferred Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">No appointments found</TableCell>
                  </TableRow>
                ) : (
                  appointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>{getNameFromEmail(appointment.patient_email)}</TableCell>
                      <TableCell>
                        {appointment.doctor_id ? 
                          getNameFromEmail(appointment.doctor_email) : 
                          'Not Assigned'}
                      </TableCell>
                      <TableCell>{appointment.contact}</TableCell>
                      <TableCell>{appointment.preferred_time || 'Not specified'}</TableCell>
                      <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                      <TableCell>{new Date(appointment.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={appointment.notes || ''}>
                        {appointment.notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminAppointmentsList;
