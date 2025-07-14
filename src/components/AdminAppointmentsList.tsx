import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Check, X, RefreshCw, Search, Filter, Users, Phone, Mail, FileText, Eye, Edit, Trash2, Plus, ChevronDown, MoreHorizontal } from "lucide-react";

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
  patient_name?: string;
  doctor_name?: string;
  appointment_type?: string;
  duration?: string;
  priority?: string;
}

// Hardcoded sample data for demonstration
const sampleAppointments: AppointmentWithDetails[] = [
  {
    id: "1",
    patient_id: "p1",
    doctor_id: "d1",
    contact: "+1 (555) 123-4567",
    preferred_time: "2024-07-15 10:00:00",
    notes: "Follow-up consultation for chronic pain management. Patient reports improvement with current medication.",
    status: "accepted",
    created_at: "2024-07-10T08:30:00Z",
    updated_at: "2024-07-10T08:30:00Z",
    patient_email: "john.doe@email.com",
    doctor_email: "dr.smith@hospital.com",
    patient_name: "John Doe",
    doctor_name: "Dr. Sarah Smith",
    appointment_type: "Follow-up",
    duration: "30 mins",
    priority: "medium"
  },
  {
    id: "2",
    patient_id: "p2",
    doctor_id: "d2",
    contact: "+1 (555) 987-6543",
    preferred_time: "2024-07-16 14:30:00",
    notes: "Initial consultation for new patient. Experiencing severe headaches for the past 3 weeks.",
    status: "pending",
    created_at: "2024-07-11T14:15:00Z",
    updated_at: "2024-07-11T14:15:00Z",
    patient_email: "emily.johnson@email.com",
    doctor_email: "dr.wilson@hospital.com",
    patient_name: "Emily Johnson",
    doctor_name: "Dr. Michael Wilson",
    appointment_type: "Consultation",
    duration: "45 mins",
    priority: "high"
  },
  {
    id: "3",
    patient_id: "p3",
    doctor_id: null,
    contact: "+1 (555) 456-7890",
    preferred_time: "2024-07-17 09:15:00",
    notes: "Routine checkup and blood work review. No specific concerns mentioned.",
    status: "pending",
    created_at: "2024-07-12T11:45:00Z",
    updated_at: "2024-07-12T11:45:00Z",
    patient_email: "robert.brown@email.com",
    doctor_email: null,
    patient_name: "Robert Brown",
    doctor_name: null,
    appointment_type: "Checkup",
    duration: "20 mins",
    priority: "low"
  },
  {
    id: "4",
    patient_id: "p4",
    doctor_id: "d1",
    contact: "+1 (555) 234-5678",
    preferred_time: "2024-07-18 16:00:00",
    notes: "Post-surgery follow-up. Patient recovering well from appendectomy performed last month.",
    status: "accepted",
    created_at: "2024-07-13T09:20:00Z",
    updated_at: "2024-07-13T09:20:00Z",
    patient_email: "maria.garcia@email.com",
    doctor_email: "dr.smith@hospital.com",
    patient_name: "Maria Garcia",
    doctor_name: "Dr. Sarah Smith",
    appointment_type: "Post-Surgery",
    duration: "25 mins",
    priority: "medium"
  },
  {
    id: "5",
    patient_id: "p5",
    doctor_id: "d3",
    contact: "+1 (555) 345-6789",
    preferred_time: "2024-07-19 11:30:00",
    notes: "Urgent consultation requested. Patient experiencing chest pain and shortness of breath.",
    status: "rejected",
    created_at: "2024-07-14T07:10:00Z",
    updated_at: "2024-07-14T07:10:00Z",
    patient_email: "david.lee@email.com",
    doctor_email: "dr.johnson@hospital.com",
    patient_name: "David Lee",
    doctor_name: "Dr. Amanda Johnson",
    appointment_type: "Urgent",
    duration: "60 mins",
    priority: "high"
  }
];

const AdminAppointmentsList = () => {
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>(sampleAppointments);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      // You could add a toast here
    }, 1000);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        color: "bg-amber-100 text-amber-800 border-amber-300",
        icon: Clock,
        label: "Pending"
      },
      accepted: {
        color: "bg-emerald-100 text-emerald-800 border-emerald-300",
        icon: Check,
        label: "Accepted"
      },
      rejected: {
        color: "bg-red-100 text-red-800 border-red-300",
        icon: X,
        label: "Rejected"
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      color: "bg-gray-100 text-gray-800 border-gray-300",
      icon: Clock,
      label: status
    };

    const Icon = config.icon;

    return (
      <Badge variant="outline" className={`${config.color} font-medium`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      high: "bg-red-50 text-red-700 border-red-200",
      medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
      low: "bg-green-50 text-green-700 border-green-200"
    };

    return (
      <Badge variant="outline" className={priorityConfig[priority as keyof typeof priorityConfig] || "bg-gray-50 text-gray-700"}>
        {priority}
      </Badge>
    );
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.contact.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusCount = (status: string) => {
    return appointments.filter(app => app.status === status).length;
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center">
            <Calendar className="mr-3 h-8 w-8 text-blue-600" />
            Appointments Dashboard
          </h2>
          <p className="text-gray-600 mt-1">Manage and monitor all patient appointments</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center hover:bg-gray-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Button className="flex items-center bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{getStatusCount('pending')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Check className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Accepted</p>
                <p className="text-2xl font-bold text-gray-900">{getStatusCount('accepted')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">{getStatusCount('rejected')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search patients, doctors, or contact..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              Recent Appointments ({filteredAppointments.length})
            </h3>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
              <span className="mt-4 text-gray-600">Loading appointments...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Patient</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Doctor</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Schedule</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Priority</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg">No appointments found</p>
                        <p className="text-sm">Try adjusting your search or filters</p>
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((appointment, index) => (
                      <tr 
                        key={appointment.id} 
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-sm">
                                {appointment.patient_name?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <div className="ml-3">
                              <p className="font-medium text-gray-900">{appointment.patient_name || 'Unknown'}</p>
                              <p className="text-sm text-gray-500">{appointment.patient_email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {appointment.doctor_name ? (
                            <div className="flex items-center">
                              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-green-600 font-semibold text-sm">
                                  {appointment.doctor_name.charAt(0)}
                                </span>
                              </div>
                              <div className="ml-3">
                                <p className="font-medium text-gray-900">{appointment.doctor_name}</p>
                                <p className="text-sm text-gray-500">{appointment.doctor_email}</p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-500 italic">Not Assigned</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center text-gray-700">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            {appointment.contact}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center text-gray-700">
                              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                              {appointment.preferred_time ? formatDate(appointment.preferred_time) : 'Not specified'}
                            </div>
                            <div className="flex items-center text-gray-500 text-sm">
                              <Clock className="h-4 w-4 mr-2 text-gray-400" />
                              {formatTime(appointment.preferred_time)}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {appointment.appointment_type || 'General'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(appointment.status)}
                        </td>
                        <td className="py-4 px-4">
                          {getPriorityBadge(appointment.priority || 'medium')}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAppointmentsList;