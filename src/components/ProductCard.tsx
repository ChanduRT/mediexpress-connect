import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ShoppingCart, Star, Package, Shield, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import ProductForm from "./ProductForm";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  stock_quantity: number;
  prescription_required: boolean;
}

interface ProductCardProps {
  product: Product;
  isAdmin: boolean;
}

const ProductCard = ({ product, isAdmin }: ProductCardProps) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleDelete = async () => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', product.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Product deleted successfully",
    });
    queryClient.invalidateQueries({ queryKey: ['products'] });
  };

  const handleAddToCart = async () => {
    try {
      setIsAddingToCart(true);
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      if (product.prescription_required) {
        navigate('/prescription', { 
          state: { 
            productId: product.id, 
            productName: product.name, 
            price: product.price 
          } 
        });
        return;
      }

      // Check if product already in cart
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select()
        .eq('user_id', session.user.id)
        .eq('product_id', product.id)
        .single();

      if (existingItem) {
        // Update quantity if already in cart
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);
        
        if (error) throw error;
      } else {
        // Add new item to cart
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: session.user.id,
            product_id: product.id,
            quantity: 1
          });
        
        if (error) throw error;
      }

      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart`,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const getStockStatus = () => {
    if (product.stock_quantity === 0) {
      return { text: "Out of Stock", color: "text-red-600", bg: "bg-red-100" };
    } else if (product.stock_quantity <= 5) {
      return { text: "Low Stock", color: "text-orange-600", bg: "bg-orange-100" };
    } else {
      return { text: "In Stock", color: "text-green-600", bg: "bg-green-100" };
    }
  };

  const stockStatus = getStockStatus();

  return (
    <Card 
      className={`group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white/95 backdrop-blur-sm ${
        isHovered ? 'ring-2 ring-blue-500' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        {product.image_url && !imageError ? (
          <div className="relative">
            <img 
              src={product.image_url} 
              alt={product.name}
              className="object-cover w-full h-48 transition-transform duration-300 group-hover:scale-110"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ) : (
          <div className="flex items-center justify-center h-48 bg-gradient-to-br from-gray-100 to-gray-200">
            <Package className="h-16 w-16 text-gray-400" />
          </div>
        )}
        
        {/* Stock Status Badge */}
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${stockStatus.color} ${stockStatus.bg} backdrop-blur-sm`}>
          {stockStatus.text}
        </div>

        {/* Prescription Badge */}
        {product.prescription_required && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Rx
          </div>
        )}

        {/* Category Badge */}
        {product.category && (
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700">
            {product.category}
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="flex justify-between items-start gap-3">
          <span className="text-lg font-bold text-gray-800 line-clamp-2 leading-tight">
            {product.name}
          </span>
          <div className="flex flex-col items-end">
            <span className="text-2xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
              ${product.price.toFixed(2)}
            </span>
            <div className="flex items-center gap-1 mt-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-gray-500">4.5</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {product.description && (
          <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
            {product.description}
          </p>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Package className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-gray-700">Stock:</span>
              <span className={`font-bold ${stockStatus.color}`}>
                {product.stock_quantity}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            {product.prescription_required && (
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-red-500" />
                <span className="text-red-600 font-medium">Prescription Required</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center pt-4 border-t border-gray-100">
        <Button
          onClick={handleAddToCart}
          disabled={isAddingToCart || product.stock_quantity === 0}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
            product.prescription_required 
              ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
              : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
          } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
        >
          {isAddingToCart ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Adding...
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              {product.prescription_required ? "Buy with Rx" : "Add to Cart"}
            </>
          )}
        </Button>

        {isAdmin && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowEditForm(true)}
              className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all duration-200 transform hover:scale-105"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleDelete}
              className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all duration-200 transform hover:scale-105"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardFooter>

      {/* Out of Stock Overlay */}
      {product.stock_quantity === 0 && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-lg p-4 text-center shadow-xl">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-lg font-bold text-gray-800">Out of Stock</p>
            <p className="text-sm text-gray-600">This item is currently unavailable</p>
          </div>
        </div>
      )}

      {showEditForm && (
        <ProductForm
          product={product}
          onClose={() => setShowEditForm(false)}
        />
      )}
    </Card>
  );
};

export default ProductCard;