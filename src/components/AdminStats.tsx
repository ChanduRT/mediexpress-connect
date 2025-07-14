import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Package, Calendar, TrendingUp, TrendingDown, Activity } from "lucide-react";

// Mock supabase for demonstration
const mockSupabase = {
  auth: {
    admin: {
      listUsers: () => Promise.resolve({
        data: {
          users: [
            { user_metadata: { role: 'patient' } },
            { user_metadata: { role: 'patient' } },
            { user_metadata: { role: 'doctor' } },
            { user_metadata: { role: 'doctor' } },
            { user_metadata: { role: 'patient' } }
          ]
        }
      })
    }
  },
  from: (table) => ({
    select: (query, options) => ({
      eq: (field, value) => Promise.resolve({ count: table === 'appointments' ? 12 : 45 })
    })
  })
};

// Define a type for the user data returned by auth.admin.listUsers()
interface AdminUserData {
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
  const [previousStats, setPreviousStats] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    totalProducts: 0,
    pendingAppointments: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      
      try {
        // Mock previous stats for demonstration
        setPreviousStats({
          totalUsers: 45,
          totalDoctors: 8,
          totalProducts: 38,
          pendingAppointments: 15
        });

        // Get all users from auth and filter them by role
        const { data: usersData, error: usersError } = await mockSupabase.auth.admin.listUsers();
        
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
        const { count: productsCount, error: productsError } = await mockSupabase
          .from('products')
          .select('*', { count: 'exact', head: true });
          
        // Count pending appointments
        const { count: pendingCount, error: pendingError } = await mockSupabase
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

  const getPercentageChange = (current, previous) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const formatPercentage = (percentage) => {
    return Math.abs(percentage).toFixed(1);
  };

  const StatCard = ({ title, value, icon: Icon, iconColor, previousValue, delay = 0 }) => {
    const percentage = getPercentageChange(value, previousValue);
    const isPositive = percentage >= 0;
    
    return (
      <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/30">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/10 group-hover:to-white/20 transition-all duration-300" />
        <CardHeader className="pb-3 relative">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-600 tracking-wide">
              {title}
            </CardTitle>
            <div className={`p-2 rounded-full bg-gradient-to-br ${iconColor} shadow-sm group-hover:shadow-md transition-all duration-300`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900 tracking-tight">
                {loading ? (
                  <div className="flex items-center gap-1">
                    <Activity className="w-5 h-5 animate-pulse text-gray-400" />
                    <span className="text-base text-gray-400">Loading...</span>
                  </div>
                ) : (
                  <span className="animate-in fade-in slide-in-from-bottom-2 duration-700" style={{ animationDelay: `${delay}ms` }}>
                    {value.toLocaleString()}
                  </span>
                )}
              </span>
            </div>
            
            {!loading && (
              <div className="flex items-center gap-1 text-xs">
                {isPositive ? (
                  <TrendingUp className="w-3 h-3 text-green-500" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-500" />
                )}
                <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(percentage)}%
                </span>
                <span className="text-gray-500">vs last period</span>
              </div>
            )}
          </div>
        </CardContent>
        
        {/* Subtle animated background */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h2>
          <p className="text-gray-600 mt-1">Real-time statistics and insights</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Activity className="w-4 h-4" />
          <span>Auto-refresh every 30s</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Patients"
          value={stats.totalUsers}
          icon={Users}
          iconColor="from-blue-500 to-blue-600"
          previousValue={previousStats.totalUsers}
          delay={0}
        />
        
        <StatCard
          title="Active Doctors"
          value={stats.totalDoctors}
          icon={UserCheck}
          iconColor="from-emerald-500 to-emerald-600"
          previousValue={previousStats.totalDoctors}
          delay={100}
        />
        
        <StatCard
          title="Available Products"
          value={stats.totalProducts}
          icon={Package}
          iconColor="from-purple-500 to-purple-600"
          previousValue={previousStats.totalProducts}
          delay={200}
        />
        
        <StatCard
          title="Pending Appointments"
          value={stats.pendingAppointments}
          icon={Calendar}
          iconColor="from-amber-500 to-amber-600"
          previousValue={previousStats.pendingAppointments}
          delay={300}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200 hover:shadow-md transition-all duration-300 cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-full group-hover:scale-110 transition-transform duration-300">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-medium text-blue-900">Manage Users</p>
              <p className="text-sm text-blue-600">View and edit user accounts</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200 hover:shadow-md transition-all duration-300 cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500 rounded-full group-hover:scale-110 transition-transform duration-300">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-medium text-emerald-900">View Appointments</p>
              <p className="text-sm text-emerald-600">Check upcoming schedules</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200 hover:shadow-md transition-all duration-300 cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500 rounded-full group-hover:scale-110 transition-transform duration-300">
              <Package className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-medium text-purple-900">Manage Products</p>
              <p className="text-sm text-purple-600">Add or update inventory</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminStats;