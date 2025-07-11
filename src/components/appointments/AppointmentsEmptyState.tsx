
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface AppointmentsEmptyStateProps {
  activeTab: 'pending' | 'accepted' | 'rejected' | 'all';
  onRefresh: () => void;
  refreshing: boolean;
}

const AppointmentsEmptyState = ({ activeTab, onRefresh, refreshing }: AppointmentsEmptyStateProps) => {
  const getEmptyStateMessage = () => {
    switch (activeTab) {
      case 'pending':
        return "No pending appointments found";
      case 'accepted':
        return "No accepted appointments found";
      case 'rejected':
        return "No rejected appointments found";
      case 'all':
        return "No appointments found";
      default:
        return "No appointments found";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-gray-500 mb-4">{getEmptyStateMessage()}</p>
      <Button
        variant="outline"
        onClick={onRefresh}
        disabled={refreshing}
        className="flex items-center"
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
        {refreshing ? "Refreshing..." : "Refresh"}
      </Button>
    </div>
  );
};

export default AppointmentsEmptyState;
