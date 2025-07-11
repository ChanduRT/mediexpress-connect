
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Minus } from "lucide-react";

interface CartItemProps {
  item: {
    id: string;
    product_id: string;
    quantity: number;
    product: {
      name: string;
      price: number;
      image_url: string | null;
    };
  };
  onUpdate: () => void;
}

const CartItem = ({ item, onUpdate }: CartItemProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const updateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1) return removeFromCart();
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', item.id);

      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error updating cart item:', error);
      toast({
        title: "Error",
        description: "Failed to update item quantity",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const removeFromCart = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', item.id);

      if (error) throw error;
      
      toast({
        title: "Item removed",
        description: `${item.product.name} has been removed from your cart`,
      });
      
      onUpdate();
    } catch (error) {
      console.error('Error removing cart item:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center space-x-4">
        {item.product.image_url && (
          <img 
            src={item.product.image_url} 
            alt={item.product.name} 
            className="w-16 h-16 object-cover rounded"
          />
        )}
        <div>
          <h3 className="font-medium">{item.product.name}</h3>
          <p className="text-sm text-gray-500">${item.product.price.toFixed(2)} each</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <Button 
            variant="outline" 
            size="icon"
            disabled={isUpdating}
            onClick={() => updateQuantity(item.quantity - 1)}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center">{item.quantity}</span>
          <Button 
            variant="outline" 
            size="icon"
            disabled={isUpdating}
            onClick={() => updateQuantity(item.quantity + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</p>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={removeFromCart}
          disabled={isUpdating}
        >
          Remove
        </Button>
      </div>
    </div>
  );
};

export default CartItem;
