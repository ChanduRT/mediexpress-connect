
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
  doctorEmail?: string | null;
}

export const useAppointments = (
  activeTab: 'all' | 'pending' | 'accepted' | 'rejected',
  onAppointmentUpdate?: () => Promise<void>
) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const { toast } = useToast();

  // Fetch appointments based on activeTab
  const fetchAppointments = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      
      // First get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        if (showLoading) {
          setLoading(false);
        }
        return;
      }
      
      const metadata = user.user_metadata || {};
      console.log(`Current user: ${user.id}, ${user.email}, role: ${metadata.role}`);
      
      let query = supabase
        .from('appointments')
        .select('*');

      // For doctors: Show appropriate appointments based on the tab
      if (metadata.role === 'doctor') {
        if (activeTab === 'pending') {
          // For pending tab, get all unassigned appointments with status pending
          query = query
            .is('doctor_id', null) // This ensures we only get unassigned appointments
            .eq('status', 'pending');
          
          console.log('Fetching pending appointments with doctor_id = null and status = pending');
        } else if (activeTab === 'all') {
          // For 'all' tab, get this doctor's accepted/rejected appointments
          query = query
            .eq('doctor_id', user.id);
            
          console.log(`Fetching all appointments for doctor_id = ${user.id}`);
        } else {
          // For accepted/rejected tabs, only get this doctor's appointments
          query = query
            .eq('doctor_id', user.id)
            .eq('status', activeTab);
          
          console.log(`Fetching ${activeTab} appointments for doctor_id = ${user.id}`);
        }
      } else if (metadata.role === 'admin') {
        // For admins: Show all appointments or filter by status if not showing all
        if (activeTab !== 'all') {
          query = query.eq('status', activeTab);
        }
      } else {
        // For patients: Get ONLY their own appointments filtered by status if not showing all
        query = query
          .eq('patient_id', user.id);
        
        if (activeTab !== 'all') {
          query = query.eq('status', activeTab);
        }
        
        console.log(`Fetching ${activeTab} appointments for patient_id = ${user.id}`);
      }

      // Execute the query
      const { data, error } = await query;

      if (error) {
        console.error('Error fetching appointments:', error);
        toast({
          variant: "destructive",
          title: "Error fetching appointments",
          description: error.message,
        });
        throw error;
      }

      // Process the appointments to include patient and doctor info
      if (data && data.length > 0) {
        const appointmentsWithData = await Promise.all(data.map(async (appointment) => {
          // Default patient name (fallback)
          let patientName = `Patient-${appointment.patient_id.slice(0, 6)}`;
          
          try {
            // Get patient user email
            const { data: userData } = await supabase.auth.admin.getUserById(appointment.patient_id);
            if (userData && userData.user) {
              patientName = userData.user.email?.split('@')[0] || patientName;
            }
          } catch (patientError) {
            console.log(`Error fetching patient info for ${appointment.patient_id}:`, patientError);
          }
          
          // Get doctor info if assigned
          let doctorEmail = null;
          if (appointment.doctor_id) {
            try {
              const { data: doctorData } = await supabase.auth.admin.getUserById(appointment.doctor_id);
              if (doctorData && doctorData.user) {
                doctorEmail = doctorData.user.email;
              }
            } catch (doctorError) {
              console.log(`Error fetching doctor info for ${appointment.doctor_id}:`, doctorError);
            }
          }
          
          return {
            ...appointment,
            patientName,
            doctorEmail
          };
        }));

        console.log('Appointments with user data:', appointmentsWithData);
        setAppointments(appointmentsWithData);
      } else {
        setAppointments([]);
        console.log('No appointments found for the selected criteria');
      }
    } catch (error) {
      console.error('Error in fetchAppointments:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load appointments. Please try again.",
      });
    } finally {
      if (showLoading) {
        setLoading(false);
      }
      setRefreshing(false);
    }
  };

  // Handle appointment status updates
  const handleUpdateStatus = async (id: string, status: 'accepted' | 'rejected') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No authenticated user found');
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please log in again to continue.",
        });
        return;
      }
      
      // Check if user is a doctor
      const metadata = user.user_metadata || {};
      if (metadata.role !== 'doctor') {
        toast({
          variant: "destructive",
          title: "Permission Denied",
          description: "Only doctors can update appointment status.",
        });
        return;
      }
      
      console.log(`Attempting to ${status} appointment ${id} by doctor ${user.id}`);
      
      // First check if the appointment is still unassigned
      const { data: appointment, error: fetchError } = await supabase
        .from('appointments')
        .select('doctor_id, status')
        .eq('id', id)
        .single();
        
      if (fetchError) {
        console.error('Error fetching appointment:', fetchError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to verify appointment status.",
        });
        throw fetchError;
      }
      
      console.log('Current appointment state:', appointment);
      
      // If already assigned to a doctor, it can't be modified
      if (appointment.doctor_id !== null) {
        toast({
          variant: "destructive",
          title: "Appointment already assigned",
          description: "This appointment has already been assigned to another doctor.",
        });
        
        // Refresh to get the latest data
        fetchAppointments();
        return;
      }

      // Update the appointment with doctor information
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status,
          doctor_id: user.id
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating appointment:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update appointment status.",
        });
        throw error;
      }

      toast({
        title: `Appointment ${status}`,
        description: `The appointment has been ${status}.`,
      });

      // Refresh appointments list
      fetchAppointments();
      
      // Notify parent component if provided
      if (onAppointmentUpdate) {
        await onAppointmentUpdate();
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update appointment status. Please try again.",
      });
    }
  };

  // Initial fetch and setup auto-refresh
  useEffect(() => {
    fetchAppointments();
    
    // Set initialLoad to false after first load
    if (initialLoad) {
      setInitialLoad(false);
    }
    
    // Auto-refresh for appointments every 30 seconds
    const interval = setInterval(() => {
      if (!loading) {
        fetchAppointments(false); // Silent refresh (no loading state)
      }
    }, 30000); // 30 seconds refresh
    
    return () => clearInterval(interval);
  }, [activeTab]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
    
    toast({
      title: "Refreshing appointments",
      description: "Getting the latest appointment data...",
    });
  };

  return {
    appointments,
    loading,
    refreshing,
    handleManualRefresh,
    handleUpdateStatus
  };
};
