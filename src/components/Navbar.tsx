import { Search, ShoppingCart, LogOut, Menu, X, Stethoscope } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const isActiveLink = (path: string) => location.pathname === path;

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "doctor":
        return "bg-blue-500";
      case "admin":
        return "bg-purple-500";
      default:
        return "bg-green-500";
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200' 
        : 'bg-white/80 backdrop-blur-md border-b border-gray-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-hover rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
            </div>
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
              MediExpress
            </div>
          </Link>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map(link => (
              <Link 
                key={link.path}
                to={link.path} 
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 relative overflow-hidden group ${
                  isActiveLink(link.path)
                    ? 'text-primary bg-primary/10 shadow-md'
                    : 'text-gray-700 hover:text-primary hover:bg-primary/5'
                }`}
              >
                <span className="relative z-10">{link.text}</span>
                {isActiveLink(link.path) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full"></div>
                )}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {/* Search button */}
            <button className="p-2.5 hover:bg-gray-100 rounded-full transition-all duration-300 hover:scale-105 group">
              <Search className="w-5 h-5 text-gray-700 group-hover:text-primary transition-colors" />
            </button>

            {/* Cart button */}
            {session && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative p-2.5 hover:bg-gray-100 rounded-full transition-all duration-300 hover:scale-105 group"
                onClick={() => navigate('/cart')}
              >
                <ShoppingCart className="w-5 h-5 text-gray-700 group-hover:text-primary transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse shadow-lg">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Button>
            )}
            
            {/* Mobile menu button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 hover:bg-gray-100 rounded-full transition-all duration-300 md:hidden hover:scale-105"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-700" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700" />
              )}
            </button>
            
            {/* Auth section */}
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3 px-3 py-2 rounded-full hover:bg-gray-100 transition-all duration-300 hover:scale-105">
                    <span className="hidden sm:inline text-sm font-medium text-gray-700">
                      {session.user.email?.split('@')[0] || 'User'}
                    </span>
                    <div className="relative">
                      <div className={`w-9 h-9 rounded-full ${getRoleBadgeColor(userRole || '')} text-white flex items-center justify-center text-sm font-semibold shadow-lg`}>
                        {session.user.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2">
                  <DropdownMenuLabel className="px-3 py-2">
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm font-medium text-gray-900">
                        {session.user.email?.split('@')[0] || 'User'}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full text-white w-fit ${getRoleBadgeColor(userRole || '')}`}>
                        {(userRole || "patient").charAt(0).toUpperCase() + (userRole || "patient").slice(1)}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")} className="rounded-lg">
                    Profile
                  </DropdownMenuItem>
                  {userRole === "doctor" && (
                    <DropdownMenuItem onClick={() => navigate("/doctor-dashboard")} className="rounded-lg">
                      Doctor Dashboard
                    </DropdownMenuItem>
                  )}
                  {userRole === "admin" && (
                    <DropdownMenuItem onClick={() => navigate("/admin-dashboard")} className="rounded-lg">
                      Admin Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="rounded-lg text-red-600 hover:bg-red-50">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="default"
                size="sm"
                className="bg-gradient-to-r from-primary to-primary-hover text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105"
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
        <div className="md:hidden bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-lg">
          <div className="py-4 px-4 space-y-2">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                  isActiveLink(link.path)
                    ? 'text-primary bg-primary/10 shadow-md'
                    : 'text-gray-700 hover:text-primary hover:bg-primary/5'
                }`}
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