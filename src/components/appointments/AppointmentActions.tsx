
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useState } from "react";

interface AppointmentActionsProps {
  appointmentId: string;
  onUpdateStatus: (id: string, status: 'accepted' | 'rejected') => Promise<void>;
}

const AppointmentActions = ({ appointmentId, onUpdateStatus }: AppointmentActionsProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStatusUpdate = async (status: 'accepted' | 'rejected') => {
    setIsProcessing(true);
    try {
      await onUpdateStatus(appointmentId, status);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex justify-end space-x-2">
      <Button 
        size="sm" 
        variant="outline" 
        className="text-green-600 border-green-600 hover:bg-green-50"
        onClick={() => handleStatusUpdate('accepted')}
        disabled={isProcessing}
      >
        <Check className="w-4 h-4 mr-1" />
        Accept
      </Button>
      <Button 
        size="sm" 
        variant="outline"
        className="text-red-600 border-red-600 hover:bg-red-50"
        onClick={() => handleStatusUpdate('rejected')}
        disabled={isProcessing}
      >
        <X className="w-4 h-4 mr-1" />
        Reject
      </Button>
    </div>
  );
};

export default AppointmentActions;
