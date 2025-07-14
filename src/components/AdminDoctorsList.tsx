import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  UserCheck, 
  UserX, 
  Users, 
  Stethoscope, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin, 
  Star,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Shield,
  Clock,
  Award,
  RefreshCw,
  Download,
  Upload
} from "lucide-react";

interface Doctor {
  id: string;
  email: string;
  name: string;
  specialty: string;
  status: 'verified' | 'pending' | 'suspended';
  created_at: string;
  phone?: string;
  location?: string;
  experience?: string;
  rating?: number;
  patients_count?: number;
  license_number?: string;
  education?: string;
  profile_image?: string;
  last_active?: string;
  consultation_fee?: number;
  availability?: string;
}

// Enhanced hardcoded sample data
const sampleDoctors: Doctor[] = [
  {
    id: '1',
    email: 'dr.smith@hospital.com',
    name: 'Dr. Sarah Smith',
    specialty: 'Cardiology',
    status: 'verified',
    created_at: '2023-05-01T10:30:00Z',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    experience: '15 years',
    rating: 4.8,
    patients_count: 342,
    license_number: 'MD-NY-12345',
    education: 'Harvard Medical School',
    last_active: '2024-07-14T09:30:00Z',
    consultation_fee: 250,
    availability: 'Mon-Fri 9AM-5PM'
  },
  {
    id: '2',
    email: 'dr.johnson@hospital.com',
    name: 'Dr. Michael Johnson',
    specialty: 'Dermatology',
    status: 'verified',
    created_at: '2023-05-15T14:20:00Z',
    phone: '+1 (555) 987-6543',
    location: 'Los Angeles, CA',
    experience: '12 years',
    rating: 4.9,
    patients_count: 278,
    license_number: 'MD-CA-67890',
    education: 'Stanford Medical School',
    last_active: '2024-07-14T11:15:00Z',
    consultation_fee: 200,
    availability: 'Mon-Sat 8AM-6PM'
  },
  {
    id: '3',
    email: 'dr.williams@hospital.com',
    name: 'Dr. Emily Williams',
    specialty: 'Pediatrics',
    status: 'pending',
    created_at: '2024-06-20T16:45:00Z',
    phone: '+1 (555) 456-7890',
    location: 'Chicago, IL',
    experience: '8 years',
    rating: 4.7,
    patients_count: 156,
    license_number: 'MD-IL-11223',
    education: 'Johns Hopkins Medical School',
    last_active: '2024-07-13T18:20:00Z',
    consultation_fee: 180,
    availability: 'Mon-Fri 10AM-4PM'
  },
  {
    id: '4',
    email: 'dr.brown@hospital.com',
    name: 'Dr. Robert Brown',
    specialty: 'Orthopedics',
    status: 'verified',
    created_at: '2023-03-10T09:15:00Z',
    phone: '+1 (555) 234-5678',
    location: 'Houston, TX',
    experience: '20 years',
    rating: 4.6,
    patients_count: 445,
    license_number: 'MD-TX-33445',
    education: 'Mayo Clinic Medical School',
    last_active: '2024-07-14T07:45:00Z',
    consultation_fee: 300,
    availability: 'Tue-Thu 9AM-3PM'
  },
  {
    id: '5',
    email: 'dr.davis@hospital.com',
    name: 'Dr. Amanda Davis',
    specialty: 'Neurology',
    status: 'suspended',
    created_at: '2023-08-05T11:30:00Z',
    phone: '+1 (555) 345-6789',
    location: 'Miami, FL',
    experience: '18 years',
    rating: 4.4,
    patients_count: 189,
    license_number: 'MD-FL-55667',
    education: 'Duke Medical School',
    last_active: '2024-07-10T15:20:00Z',
    consultation_fee: 280,
    availability: 'Currently Unavailable'
  },
  {
    id: '6',
    email: 'dr.wilson@hospital.com',
    name: 'Dr. James Wilson',
    specialty: 'Psychiatry',
    status: 'verified',
    created_at: '2023-09-12T13:00:00Z',
    phone: '+1 (555) 567-8901',
    location: 'Seattle, WA',
    experience: '14 years',
    rating: 4.9,
    patients_count: 298,
    license_number: 'MD-WA-77889',
    education: 'University of Washington Medical School',
    last_active: '2024-07-14T10:30:00Z',
    consultation_fee: 220,
    availability: 'Mon-Fri 11AM-7PM'
  },
  {
    id: '7',
    email: 'dr.garcia@hospital.com',
    name: 'Dr. Maria Garcia',
    specialty: 'Oncology',
    status: 'pending',
    created_at: '2024-07-01T08:45:00Z',
    phone: '+1 (555) 678-9012',
    location: 'Phoenix, AZ',
    experience: '10 years',
    rating: 4.5,
    patients_count: 167,
    license_number: 'MD-AZ-99001',
    education: 'UCLA Medical School',
    last_active: '2024-07-13T16:30:00Z',
    consultation_fee: 320,
    availability: 'Mon-Wed 9AM-1PM'
  },
  {
    id: '8',
    email: 'dr.lee@hospital.com',
    name: 'Dr. David Lee',
    specialty: 'Radiology',
    status: 'verified',
    created_at: '2023-11-18T12:15:00Z',
    phone: '+1 (555) 789-0123',
    location: 'Boston, MA',
    experience: '16 years',
    rating: 4.7,
    patients_count: 312,
    license_number: 'MD-MA-22334',
    education: 'Harvard Medical School',
    last_active: '2024-07-14T08:15:00Z',
    consultation_fee: 240,
    availability: 'Mon-Fri 7AM-3PM'
  }
];

const AdminDoctorsList = () => {
  const [doctors, setDoctors] = useState<Doctor[]>(sampleDoctors);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleVerifyDoctor = async (doctorId: string) => {
    setDoctors(doctors.map(doc => 
      doc.id === doctorId ? {...doc, status: 'verified'} : doc
    ));
  };

  const handleSuspendDoctor = async (doctorId: string) => {
    setDoctors(doctors.map(doc => 
      doc.id === doctorId ? {...doc, status: 'suspended'} : doc
    ));
  };

  const handleDeleteDoctor = async (doctorId: string) => {
    setDoctors(doctors.filter(doc => doc.id !== doctorId));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      verified: {
        color: "bg-emerald-100 text-emerald-800 border-emerald-300",
        icon: UserCheck,
        label: "Verified"
      },
      pending: {
        color: "bg-amber-100 text-amber-800 border-amber-300",
        icon: Clock,
        label: "Pending"
      },
      suspended: {
        color: "bg-red-100 text-red-800 border-red-300",
        icon: UserX,
        label: "Suspended"
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    const Icon = config.icon;
    return (
      <Badge variant="outline" className={`${config.color} font-medium`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || doctor.status === statusFilter;
    const matchesSpecialty = specialtyFilter === "all" || doctor.specialty === specialtyFilter;
    return matchesSearch && matchesStatus && matchesSpecialty;
  });

  const getStatusCount = (status: string) => {
    return doctors.filter(doc => doc.status === status).length;
  };

  const getUniqueSpecialties = () => {
    return [...new Set(doctors.map(doc => doc.specialty))];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getLastActiveText = (lastActive: string) => {
    const now = new Date();
    const lastActiveDate = new Date(lastActive);
    const diffInHours = Math.floor((now.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Active now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center">
            <Stethoscope className="mr-3 h-8 w-8 text-blue-600" />
            Doctors Management
          </h2>
          <p className="text-gray-600 mt-1">Manage and monitor all registered doctors</p>
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
          <Button variant="outline" className="flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="flex items-center bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Doctor
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
                <p className="text-sm font-medium text-gray-600">Total Doctors</p>
                <p className="text-2xl font-bold text-gray-900">{doctors.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-gray-900">{getStatusCount('verified')}</p>
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
              <div className="p-2 bg-red-100 rounded-lg">
                <UserX className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Suspended</p>
                <p className="text-2xl font-bold text-gray-900">{getStatusCount('suspended')}</p>
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
                placeholder="Search doctors by name, email, or specialty..."
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
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
              >
                <option value="all">All Specialties</option>
                {getUniqueSpecialties().map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Doctors Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              Registered Doctors ({filteredDoctors.length})
            </h3>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
              <span className="mt-4 text-gray-600">Loading doctors...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Doctor</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Specialty</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Performance</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Last Active</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDoctors.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-500">
                        <Stethoscope className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg">No doctors found</p>
                        <p className="text-sm">Try adjusting your search or filters</p>
                      </td>
                    </tr>
                  ) : (
                    filteredDoctors.map((doctor, index) => (
                      <tr 
                        key={doctor.id} 
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold">
                                {doctor.name.split(' ').map(n => n.charAt(0)).join('')}
                              </span>
                            </div>
                            <div className="ml-3">
                              <p className="font-medium text-gray-900">{doctor.name}</p>
                              <p className="text-sm text-gray-500">{doctor.email}</p>
                              <div className="flex items-center mt-1">
                                <Award className="h-3 w-3 text-gray-400 mr-1" />
                                <span className="text-xs text-gray-500">{doctor.experience} exp</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                              {doctor.specialty}
                            </span>
                            <div className="flex items-center text-sm text-gray-500">
                              <MapPin className="h-3 w-3 mr-1" />
                              {doctor.location}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-700">
                              <Phone className="h-3 w-3 mr-2 text-gray-400" />
                              {doctor.phone}
                            </div>
                            <div className="flex items-center text-sm text-gray-700">
                              <Mail className="h-3 w-3 mr-2 text-gray-400" />
                              {doctor.email}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <div className="flex mr-2">
                                {renderStars(doctor.rating || 0)}
                              </div>
                              <span className="text-sm font-medium text-gray-700">{doctor.rating}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Users className="h-3 w-3 mr-1" />
                              {doctor.patients_count} patients
                            </div>
                            <div className="text-sm font-medium text-green-600">
                              ${doctor.consultation_fee}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(doctor.status)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <span className="text-sm text-gray-700">
                              {getLastActiveText(doctor.last_active || '')}
                            </span>
                            <div className="text-xs text-gray-500">
                              {doctor.availability}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <Edit className="h-4 w-4" />
                            </Button>
                            {doctor.status === 'pending' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                                onClick={() => handleVerifyDoctor(doctor.id)}
                              >
                                <UserCheck className="h-4 w-4" />
                              </Button>
                            )}
                            {doctor.status === 'verified' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700"
                                onClick={() => handleSuspendDoctor(doctor.id)}
                              >
                                <Shield className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteDoctor(doctor.id)}
                            >
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

export default AdminDoctorsList;