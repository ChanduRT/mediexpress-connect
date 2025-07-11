
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import ProductForm from "@/components/ProductForm";
import Navbar from "@/components/Navbar";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const Products = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Check if user role is admin
        const userRole = session.user.user_metadata?.role;
        
        if (userRole === 'admin') {
          setIsAdmin(true);
        } else {
          // Remove alternative admin check - only check user_metadata role
          setIsAdmin(false);
        }
      } else {
        // Redirect to auth if no session
        navigate("/auth");
      }
    };
    
    checkAdminStatus();
  }, [navigate]);

  // Fetch products
  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch products",
          variant: "destructive",
        });
        throw error;
      }
      return data;
    },
  });

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          {isAdmin && (
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          )}
        </div>

        {isAdmin && showAddForm && <ProductForm onClose={() => setShowAddForm(false)} />}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {products?.map((product) => (
            <ProductCard key={product.id} product={product} isAdmin={isAdmin} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Products;
