
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock } from "lucide-react";

const BookAppointment = () => {
  const [loading, setLoading] = useState(false);
  const [contact, setContact] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [notes, setNotes] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "Please log in to book an appointment",
        });
        navigate("/auth");
        return;
      }
      
      setUserId(session.user.id);
    };
    
    checkAuth();
  }, [navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to book an appointment",
      });
      navigate("/auth");
      return;
    }
    
    if (!contact) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide contact information",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      console.log(`Creating appointment for patient ${userId}`);
      
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          patient_id: userId,
          contact,
          preferred_time: preferredTime,
          notes,
          status: 'pending',
          doctor_id: null
        });
        
      if (error) {
        console.error("Error creating appointment:", error);
        throw error;
      }
      
      console.log("Appointment created successfully:", data);
      
      toast({
        title: "Appointment Booked",
        description: "Your appointment request has been submitted and is awaiting doctor assignment.",
      });
      
      // Reset form
      setContact("");
      setPreferredTime("");
      setNotes("");
      
      // Navigate to appointments history
      navigate("/appointments");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An error occurred while booking your appointment",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <h1 className="text-3xl font-bold mb-6">Book an Appointment</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Request a Consultation</CardTitle>
            <CardDescription>
              Complete this form to request an appointment. A doctor will be assigned to your case after review.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="contact">Contact Information</Label>
                <Input
                  id="contact"
                  placeholder="Phone number or email"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  required
                />
                <p className="text-sm text-gray-500">How should the doctor contact you?</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="preferred-time">Preferred Time (Optional)</Label>
                <Input
                  id="preferred-time"
                  placeholder="e.g. Weekday afternoons, Mondays at 2 PM"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                />
                <p className="text-sm text-gray-500">When would you prefer to have your appointment?</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Symptoms or Reason (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Describe your symptoms or reason for consultation"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
                <p className="text-sm text-gray-500">This helps doctors understand your needs before the appointment</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mt-6">
                <h3 className="text-sm font-medium text-blue-800 flex items-center">
                  <Clock className="w-4 h-4 mr-2" /> How it works
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  After booking, doctors will review your request. Once a doctor accepts your appointment, 
                  you'll receive a notification with their contact details.
                </p>
              </div>
              
              <Button type="submit" className="w-full flex items-center justify-center" disabled={loading}>
                <Calendar className="w-4 h-4 mr-2" />
                {loading ? "Submitting..." : "Book Appointment"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookAppointment;
