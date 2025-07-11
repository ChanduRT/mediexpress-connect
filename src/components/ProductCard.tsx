
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ShoppingCart } from "lucide-react";
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

  return (
    <Card className="overflow-hidden">
      {product.image_url && (
        <div className="aspect-w-16 aspect-h-9">
          <img
            src={product.image_url}
            alt={product.name}
            className="object-cover w-full h-48"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
          <span>{product.name}</span>
          <span className="text-lg font-semibold text-primary">
            ${product.price.toFixed(2)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">{product.description}</p>
        <div className="mt-2 space-y-1">
          <p className="text-sm">
            <span className="font-medium">Category:</span> {product.category || "N/A"}
          </p>
          <p className="text-sm">
            <span className="font-medium">Stock:</span> {product.stock_quantity}
          </p>
          {product.prescription_required && (
            <p className="text-sm text-red-600 font-medium">
              Prescription Required
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          onClick={handleAddToCart}
          className="flex items-center gap-2"
          disabled={isAddingToCart}
        >
          <ShoppingCart className="h-4 w-4" />
          {product.prescription_required ? "Buy with Prescription" : "Add to Cart"}
        </Button>
        {isAdmin && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowEditForm(true)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardFooter>
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
