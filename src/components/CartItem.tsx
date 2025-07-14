import { useState } from "react";
import { Plus, Minus, X, Heart, ShoppingCart } from "lucide-react";

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
  const [isHovered, setIsHovered] = useState(false);

  const showToast = (title: string, description: string, variant: 'default' | 'destructive' = 'default') => {
    // Mock toast implementation - you would integrate with your actual toast system
    console.log(`Toast: ${title} - ${description} (${variant})`);
  };

  const updateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1) return removeFromCart();
    
    setIsUpdating(true);
    try {
      // Mock API call - replace with your actual API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate successful update
      onUpdate();
    } catch (error) {
      console.error('Error updating cart item:', error);
      showToast("Error", "Failed to update item quantity", "destructive");
    } finally {
      setIsUpdating(false);
    }
  };

  const removeFromCart = async () => {
    setIsUpdating(true);
    try {
      // Mock API call - replace with your actual API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      showToast("Item removed", `${item.product.name} has been removed from your cart`);
      
      onUpdate();
    } catch (error) {
      console.error('Error removing cart item:', error);
      showToast("Error", "Failed to remove item from cart", "destructive");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div 
      className={`group relative bg-white rounded-xl p-6 mb-4 shadow-sm border transition-all duration-300 hover:shadow-lg hover:border-blue-200 ${
        isUpdating ? 'opacity-50 pointer-events-none' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Loading overlay */}
      {isUpdating && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Remove button - top right */}
      <button 
        className={`absolute top-3 right-3 h-8 w-8 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-600 transition-all duration-200 flex items-center justify-center ${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
        }`}
        onClick={removeFromCart}
        disabled={isUpdating}
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start space-x-4">
        {/* Product Image */}
        <div className="relative flex-shrink-0">
          {item.product.image_url ? (
            <div className="relative overflow-hidden rounded-lg">
              <img 
                src={item.product.image_url} 
                alt={item.product.name} 
                className="w-20 h-20 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ) : (
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
              <ShoppingCart className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <h3 className="font-semibold text-gray-900 text-lg truncate group-hover:text-blue-600 transition-colors duration-200">
                {item.product.name}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm text-gray-500">Price:</span>
                <span className="font-medium text-green-600">${item.product.price.toFixed(2)}</span>
              </div>
            </div>

            {/* Wishlist button */}
            <button 
              className="h-8 w-8 rounded-full hover:bg-pink-100 hover:text-pink-600 transition-all duration-200 flex items-center justify-center"
            >
              <Heart className="h-4 w-4" />
            </button>
          </div>

          {/* Quantity Controls and Total */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500 font-medium">Quantity:</span>
              <div className="flex items-center bg-gray-50 rounded-full p-1">
                <button 
                  className="h-8 w-8 rounded-full hover:bg-white hover:shadow-sm transition-all duration-200 flex items-center justify-center disabled:opacity-50"
                  disabled={isUpdating}
                  onClick={() => updateQuantity(item.quantity - 1)}
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-12 text-center font-medium text-gray-900">
                  {item.quantity}
                </span>
                <button 
                  className="h-8 w-8 rounded-full hover:bg-white hover:shadow-sm transition-all duration-200 flex items-center justify-center disabled:opacity-50"
                  disabled={isUpdating}
                  onClick={() => updateQuantity(item.quantity + 1)}
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Total Price */}
            <div className="text-right">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ${(item.product.price * item.quantity).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hover indicator */}
      <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ${
        isHovered ? 'w-full' : 'w-0'
      }`}></div>
    </div>
  );
};

export default CartItem;