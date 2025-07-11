
import { Search, ShoppingCart, LogOut, Menu } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      
      if (session?.user) {
        const metadata = session.user.user_metadata || {};
        setUserRole(metadata.role || "patient");
        fetchCartCount(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      
      if (session?.user) {
        const metadata = session.user.user_metadata || {};
        setUserRole(metadata.role || "patient");
        fetchCartCount(session.user.id);
      } else {
        setUserRole(null);
        setCartCount(0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch cart count when user is logged in
  const fetchCartCount = async (userId: string) => {
    try {
      const { count, error } = await supabase
        .from('cart_items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
        
      if (!error) {
        setCartCount(count || 0);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  // Navigation links based on user role
  const getNavigationLinks = () => {
    const commonLinks = [
      { text: "Home", path: "/" },
      { text: "Products", path: "/products" },
    ];
    
    if (!session) return commonLinks;
    
    switch (userRole) {
      case "doctor":
        return [
          ...commonLinks,
          { text: "Dashboard", path: "/doctor-dashboard" },
          { text: "Profile", path: "/profile" },
        ];
      case "admin":
        return [
          ...commonLinks,
          { text: "Admin Dashboard", path: "/admin-dashboard" },
          { text: "Profile", path: "/profile" },
        ];
      default: // patient or unknown role
        return [
          ...commonLinks,
          { text: "Appointments", path: "/appointments" },
          { text: "Book Appointment", path: "/book-appointment" },
          { text: "Prescription", path: "/prescription" },
          { text: "Profile", path: "/profile" },
        ];
    }
  };
  
  const navLinks = getNavigationLinks();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-primary text-2xl font-semibold">MediExpress</div>
          </Link>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map(link => (
              <Link 
                key={link.path}
                to={link.path} 
                className="text-gray-700 hover:text-primary transition-colors"
              >
                {link.text}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Search className="w-5 h-5 text-gray-700" />
            </button>
            {session && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                onClick={() => navigate('/cart')}
              >
                <ShoppingCart className="w-5 h-5 text-gray-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            )}
            
            {/* Mobile menu button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors md:hidden"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
            
            {/* Auth buttons */}
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <span className="hidden sm:inline">{session.user.email}</span>
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm">
                      {session.user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <span className="capitalize">{userRole || "User"}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    Profile
                  </DropdownMenuItem>
                  {userRole === "doctor" && (
                    <DropdownMenuItem onClick={() => navigate("/doctor-dashboard")}>
                      Doctor Dashboard
                    </DropdownMenuItem>
                  )}
                  {userRole === "admin" && (
                    <DropdownMenuItem onClick={() => navigate("/admin-dashboard")}>
                      Admin Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/auth")}
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile navigation menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-2">
          <div className="space-y-1 px-4">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className="block py-2 text-base text-gray-700 hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.text}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
