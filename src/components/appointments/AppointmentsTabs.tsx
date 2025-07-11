
import { Button } from "@/components/ui/button";
import { Check, Clock, X } from "lucide-react";

interface AppointmentsTabsProps {
  activeTab: 'pending' | 'accepted' | 'rejected' | 'all';
  onTabChange: (tab: 'pending' | 'accepted' | 'rejected') => void;
  loading: boolean;
}

const AppointmentsTabs = ({ activeTab, onTabChange, loading }: AppointmentsTabsProps) => {
  return (
    <div className="flex space-x-2">
      <Button 
        variant={activeTab === 'pending' ? 'default' : 'outline'} 
        onClick={() => onTabChange('pending')}
        className="flex items-center"
      >
        <Clock className="w-4 h-4 mr-1" /> Pending
        {activeTab === 'pending' && loading && <span className="ml-2 animate-pulse">•</span>}
      </Button>
      <Button 
        variant={activeTab === 'accepted' ? 'default' : 'outline'} 
        onClick={() => onTabChange('accepted')}
        className="flex items-center"
      >
        <Check className="w-4 h-4 mr-1" /> Accepted
        {activeTab === 'accepted' && loading && <span className="ml-2 animate-pulse">•</span>}
      </Button>
      <Button 
        variant={activeTab === 'rejected' ? 'default' : 'outline'} 
        onClick={() => onTabChange('rejected')}
        className="flex items-center"
      >
        <X className="w-4 h-4 mr-1" /> Rejected
        {activeTab === 'rejected' && loading && <span className="ml-2 animate-pulse">•</span>}
      </Button>
    </div>
  );
};

export default AppointmentsTabs;
