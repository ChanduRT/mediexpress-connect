import { useState } from "react";
import { Edit, Trash2, ShoppingCart, Heart, Star, Package, Shield } from "lucide-react";

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
  const [isFavorited, setIsFavorited] = useState(false);

  const showToast = (title: string, description: string, variant: 'default' | 'destructive' = 'default') => {
    console.log(`Toast: ${title} - ${description} (${variant})`);
  };

  const handleDelete = async () => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      showToast("Success", "Product deleted successfully");
    } catch (error) {
      showToast("Error", "Failed to delete product", "destructive");
    }
  };

  const handleAddToCart = async () => {
    try {
      setIsAddingToCart(true);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (product.prescription_required) {
        showToast("Prescription Required", "Redirecting to prescription upload...");
        return;
      }
      
      showToast("Added to cart", `${product.name} has been added to your cart`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast("Error", "Failed to add item to cart", "destructive");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const getStockStatus = () => {
    if (product.stock_quantity === 0) return { text: "Out of Stock", color: "text-red-500", bgColor: "bg-red-50" };
    if (product.stock_quantity < 5) return { text: "Low Stock", color: "text-yellow-600", bgColor: "bg-yellow-50" };
    return { text: "In Stock", color: "text-green-600", bgColor: "bg-green-50" };
  };

  const stockStatus = getStockStatus();

  return (
    <div 
      className={`group relative bg-white rounded-2xl shadow-sm border transition-all duration-300 hover:shadow-xl hover:border-blue-200 overflow-hidden ${
        isHovered ? 'transform hover:-translate-y-1' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div className="relative aspect-w-16 aspect-h-9 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="object-cover w-full h-48 transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <Package className="h-16 w-16 text-gray-400" />
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Favorite button */}
        <button 
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
            isFavorited ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600 hover:bg-white'
          } ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
          onClick={() => setIsFavorited(!isFavorited)}
        >
          <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        {/* Prescription badge */}
        {product.prescription_required && (
          <div className="absolute top-3 left-3 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Prescription Required
          </div>
        )}

        {/* Stock status badge */}
        <div className={`absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${stockStatus.bgColor} ${stockStatus.color}`}>
          {stockStatus.text}
        </div>
      </div>

      {/* Product Details */}
      <div className="p-6">
        {/* Header with name and price */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-lg text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
            {product.name}
          </h3>
          <div className="text-right ml-4 flex-shrink-0">
            <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ${product.price.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
          {product.description || "No description available"}
        </p>

        {/* Product Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 uppercase font-medium">Category</p>
            <p className="text-sm font-medium text-gray-900">{product.category || "N/A"}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 uppercase font-medium">Stock</p>
            <p className="text-sm font-medium text-gray-900">{product.stock_quantity}</p>
          </div>
        </div>

        {/* Rating (mock) */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-4 w-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
            ))}
          </div>
          <span className="text-sm text-gray-600">(4.0) • 127 reviews</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 pb-6">
        <div className="flex gap-3">
          <button 
            onClick={handleAddToCart}
            disabled={isAddingToCart || product.stock_quantity === 0}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
              product.stock_quantity === 0 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
            }`}
          >
            {isAddingToCart ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Adding...
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                {product.prescription_required ? "Buy with Prescription" : "Add to Cart"}
              </>
            )}
          </button>

          {/* Admin Controls */}
          {isAdmin && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowEditForm(true)}
                className="p-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
              >
                <Edit className="h-4 w-4 text-gray-600 group-hover:text-blue-600" />
              </button>
              <button
                onClick={handleDelete}
                className="p-3 rounded-xl border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all duration-200 group"
              >
                <Trash2 className="h-4 w-4 text-gray-600 group-hover:text-red-600" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Loading overlay */}
      {isAddingToCart && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="bg-white rounded-full p-4 shadow-lg">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      )}

      {/* Hover effect border */}
      <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ${
        isHovered ? 'w-full' : 'w-0'
      }`}></div>
    </div>
  );
};

export default ProductCard;