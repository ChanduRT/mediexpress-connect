
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminUsersList from "@/components/AdminUsersList";
import AdminDoctorsList from "@/components/AdminDoctorsList";
import AdminStats from "@/components/AdminStats";
import AdminAppointmentsList from "@/components/AdminAppointmentsList";

const AdminDashboard = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuthAndRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }
      
      const metadata = session?.user?.user_metadata || {};
      setUserRole(metadata.role || null);
      
      setLoading(false);
      
      if (metadata.role !== 'admin') {
        toast({
          title: "Access Denied",
          description: "Only admin users can access this page",
          variant: "destructive",
        });
        navigate("/");
      }
    };
    
    checkAuthAndRole();
  }, [navigate, toast]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>

        <div className="mb-6">
          <AdminStats />
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="users">Manage Users</TabsTrigger>
            <TabsTrigger value="doctors">Manage Doctors</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="products">Manage Products</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            <AdminUsersList />
          </TabsContent>
          
          <TabsContent value="doctors">
            <AdminDoctorsList />
          </TabsContent>
          
          <TabsContent value="appointments">
            <AdminAppointmentsList />
          </TabsContent>
          
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Products Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Manage inventory, prices and product details.</p>
                <button 
                  onClick={() => navigate('/products')} 
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                >
                  Go to Products Page
                </button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
