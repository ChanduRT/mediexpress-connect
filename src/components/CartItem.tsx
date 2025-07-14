import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Minus, Trash2 } from "lucide-react";

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
    <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 hover:border-gray-200">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 to-purple-50/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      {/* Loading overlay */}
      {isUpdating && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      <div className="relative flex items-center gap-6">
        {/* Product Image */}
        <div className="relative overflow-hidden rounded-xl bg-gray-50 flex-shrink-0">
          {item.product.image_url ? (
            <img 
              src={item.product.image_url} 
              alt={item.product.name}
              className="w-24 h-24 object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <div className="w-8 h-8 bg-gray-300 rounded-lg" />
            </div>
          )}
          
          {/* Subtle image overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-lg leading-tight truncate mb-2 group-hover:text-blue-600 transition-colors duration-200">
            {item.product.name}
          </h3>
          
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <span className="bg-gray-100 px-2 py-1 rounded-full font-medium">
              ${item.product.price.toFixed(2)} each
            </span>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateQuantity(item.quantity - 1)}
                disabled={isUpdating}
                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors duration-200"
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <span className="w-12 text-center font-semibold text-gray-900 select-none">
                {item.quantity}
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateQuantity(item.quantity + 1)}
                disabled={isUpdating}
                className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors duration-200"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Remove Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={removeFromCart}
              disabled={isUpdating}
              className="h-8 px-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        </div>

        {/* Price Display */}
        <div className="text-right flex-shrink-0">
          <div className="text-2xl font-bold text-gray-900 mb-1">
            ${(item.product.price * item.quantity).toFixed(2)}
          </div>
          <div className="text-sm text-gray-500">
            Total for {item.quantity} {item.quantity === 1 ? 'item' : 'items'}
          </div>
        </div>
      </div>

      {/* Animated border on hover */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-200 transition-colors duration-300 pointer-events-none" />
    </div>
  );
};

export default CartItem;