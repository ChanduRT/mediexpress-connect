
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

// Define a type for the user data returned by auth.admin.listUsers()
interface AdminUserData extends User {
  user_metadata: {
    role?: string;
    [key: string]: any;
  };
}

const AdminStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    totalProducts: 0,
    pendingAppointments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      
      try {
        // Get all users from auth and filter them by role
        const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
        
        if (usersError) throw usersError;
        
        // Type assertion to use our extended type
        const users = usersData?.users as AdminUserData[] || [];
        
        // Count users with patient role
        const patientsCount = users.filter(user => 
          user.user_metadata?.role === 'patient').length || 0;
          
        // Count doctors
        const doctorsCount = users.filter(user => 
          user.user_metadata?.role === 'doctor').length || 0;
          
        // Count total products
        const { count: productsCount, error: productsError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });
          
        // Count pending appointments
        const { count: pendingCount, error: pendingError } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');
          
        // If no errors, update stats
        if (!productsError && !pendingError) {
          setStats({
            totalUsers: patientsCount,
            totalDoctors: doctorsCount,
            totalProducts: productsCount || 0,
            pendingAppointments: pendingCount || 0
          });
        }
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Total Patients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {loading ? "..." : stats.totalUsers}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Total Doctors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {loading ? "..." : stats.totalDoctors}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {loading ? "..." : stats.totalProducts}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Pending Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {loading ? "..." : stats.pendingAppointments}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStats;
