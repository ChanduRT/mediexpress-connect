
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import DoctorAppointments from "@/components/DoctorAppointments";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Clock, UserRound, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const DoctorDashboard = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [doctorName, setDoctorName] = useState<string>("Doctor");
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchDashboardData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }
      
      const metadata = session?.user?.user_metadata || {};
      setUserRole(metadata.role || null);
      
      if (session.user.email) {
        setDoctorName(session.user.email.split('@')[0]);
      }
      
      console.log("Fetching pending appointments count");
      
      // Count pending unassigned appointments using the new appointments table
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .is('doctor_id', null)
        .eq('status', 'pending');

      if (error) {
        console.error("Error fetching pending count:", error);
        toast({
          variant: "destructive",
          title: "Error fetching appointments",
          description: error.message,
        });
      } else {
        console.log("Pending appointments data:", data);
        if (data) {
          setPendingCount(data.length);
          console.log(`Found ${data.length} pending appointments`);
        }
      }
      
      setLoading(false);
      
      if (metadata.role !== 'doctor') {
        toast({
          title: "Access Denied",
          description: "Only doctors can access this page",
          variant: "destructive",
        });
        navigate("/");
      }
    } catch (error) {
      console.error("Error in fetchDashboardData:", error);
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Error loading dashboard",
        description: "Please try refreshing the page",
      });
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Log current user information for debugging
    const getUserInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const metadata = user.user_metadata || {};
        console.log(`Current user: ${user.id}, ${user.email}, role: ${metadata.role}`);
      }
    };
    
    getUserInfo();
  }, [navigate, toast]);

  // Fetch pending count on regular intervals to keep the dashboard updated
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!loading) {
        try {
          const { data, error } = await supabase
            .from('appointments')
            .select('*')
            .is('doctor_id', null)
            .eq('status', 'pending');
    
          if (!error && data) {
            setPendingCount(data.length);
          } else if (error) {
            console.error("Error in interval fetch:", error);
          }
        } catch (err) {
          console.error("Error in interval:", err);
        }
      }
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [loading]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    
    toast({
      title: "Dashboard Refreshed",
      description: "The latest data has been loaded",
    });
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-2 text-gray-600">Loading dashboard...</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
          <Button 
            variant="outline" 
            onClick={handleManualRefresh} 
            disabled={refreshing}
            className="flex items-center"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserRound className="w-5 h-5 mr-2" /> Welcome, Dr. {doctorName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <p className="text-gray-600">
                  Review and manage patient appointments below.
                </p>
                
                {pendingCount > 0 && (
                  <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                      <h3 className="text-sm font-medium text-yellow-800">Appointment Requests</h3>
                    </div>
                    <p className="mt-2 text-sm text-yellow-700">
                      There {pendingCount === 1 ? 'is' : 'are'} <span className="font-bold">{pendingCount}</span> pending appointment{pendingCount !== 1 ? 's' : ''} awaiting your review.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <DoctorAppointments onAppointmentUpdate={fetchDashboardData} />
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
