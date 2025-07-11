
import { Badge } from "@/components/ui/badge";
import { Check, Clock, X } from "lucide-react";

interface AppointmentStatusBadgeProps {
  status: string;
}

const AppointmentStatusBadge = ({ status }: AppointmentStatusBadgeProps) => {
  switch (status) {
    case 'pending': 
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
          <Clock className="w-3 h-3 mr-1" /> Pending
        </Badge>
      );
    case 'accepted':
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
          <Check className="w-3 h-3 mr-1" /> Accepted
        </Badge>
      );
    case 'rejected':
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
          <X className="w-3 h-3 mr-1" /> Rejected
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800">
          {status}
        </Badge>
      );
  }
};

export default AppointmentStatusBadge;
