
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import CartItem from "@/components/CartItem";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }
      
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:product_id (
            name,
            price,
            image_url
          )
        `)
        .eq('user_id', session.user.id);
      
      if (error) throw error;
      
      setCartItems(data || []);
      
      // Calculate total
      const sum = (data || []).reduce((acc, item) => {
        return acc + (item.product.price * item.quantity);
      }, 0);
      
      setTotal(sum);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast({
        title: "Error",
        description: "Failed to load your cart",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = () => {
    toast({
      title: "Checkout",
      description: "Checkout functionality will be implemented soon!",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
        
        {loading ? (
          <div className="flex justify-center py-8">Loading your cart...</div>
        ) : cartItems.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <p className="mb-4">Your cart is empty</p>
                <Button onClick={() => navigate('/products')}>
                  Browse Products
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Cart Items ({cartItems.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {cartItems.map((item) => (
                  <CartItem 
                    key={item.id} 
                    item={item} 
                    onUpdate={fetchCartItems}
                  />
                ))}
              </CardContent>
              <CardFooter className="flex justify-between pt-6">
                <div>
                  <span className="text-muted-foreground">Total:</span>
                  <span className="text-2xl font-bold ml-2">${total.toFixed(2)}</span>
                </div>
                <Button onClick={handleCheckout}>
                  Checkout
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
