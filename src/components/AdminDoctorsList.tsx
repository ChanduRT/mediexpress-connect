
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const AdminDoctorsList = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      
      // Query users with doctor role
      // In a production app, this would need a secure backend endpoint
      // For now, let's simulate with placeholder data
      
      const mockDoctors = [
        { 
          id: '1', 
          email: 'doctor1@example.com', 
          name: 'Dr. John Smith', 
          specialty: 'Cardiology',
          status: 'verified',
          created_at: '2023-05-01' 
        },
        { 
          id: '2', 
          email: 'doctor2@example.com', 
          name: 'Dr. Sarah Johnson', 
          specialty: 'Dermatology',
          status: 'pending',
          created_at: '2023-05-15' 
        }
      ];
      
      setDoctors(mockDoctors);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast({
        title: "Error",
        description: "Failed to load doctors data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDoctor = async (doctorId: string) => {
    try {
      // In a production app, this would update the doctor's status
      toast({
        title: "Action not available",
        description: "Doctor verification requires additional backend setup",
      });
      
      // Update the UI optimistically
      setDoctors(doctors.map(doc => 
        doc.id === doctorId ? {...doc, status: 'verified'} : doc
      ));
    } catch (error) {
      console.error("Error verifying doctor:", error);
      toast({
        title: "Error",
        description: "Failed to verify doctor",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDoctor = async (doctorId: string) => {
    try {
      // In a production app, this would delete the doctor
      toast({
        title: "Action not available",
        description: "Doctor deletion requires additional backend setup",
      });
      
      // Update the UI optimistically
      setDoctors(doctors.filter(doc => doc.id !== doctorId));
    } catch (error) {
      console.error("Error deleting doctor:", error);
      toast({
        title: "Error",
        description: "Failed to delete doctor",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-xl font-bold mb-4">Manage Doctors</h3>
        
        {loading ? (
          <div className="text-center py-4">Loading doctors...</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">No doctors found</TableCell>
                  </TableRow>
                ) : (
                  doctors.map((doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell>{doctor.name}</TableCell>
                      <TableCell>{doctor.email}</TableCell>
                      <TableCell>{doctor.specialty}</TableCell>
                      <TableCell>
                        <span className={`capitalize px-2 py-1 rounded-full text-xs ${
                          doctor.status === 'verified' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {doctor.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {doctor.status === 'pending' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleVerifyDoctor(doctor.id)}
                            className="text-green-500 hover:text-green-700 mr-2"
                          >
                            Verify
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteDoctor(doctor.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Delete
                        </Button>
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

export default AdminDoctorsList;
