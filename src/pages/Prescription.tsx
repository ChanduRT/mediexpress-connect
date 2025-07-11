
import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, AlertCircle, Search, ShoppingCart } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { createWorker } from 'tesseract.js';

const Prescription = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [matchingProducts, setMatchingProducts] = useState<any[]>([]);
  const [extractedText, setExtractedText] = useState<string>('');
  
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { productId, productName, price } = location.state || {};
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === "application/pdf" || selectedFile.type.startsWith("image/")) {
        setFile(selectedFile);
        setVerificationResult(null);
        setMatchingProducts([]);
      } else {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload a PDF or image file"
        });
      }
    }
  };

  const performOCR = async (imageFile: File) => {
    const worker = await createWorker('eng');
    
    try {
      // Perform OCR on the image
      const result = await worker.recognize(imageFile);
      await worker.terminate();
      return result.data.text.toLowerCase();
    } catch (error) {
      console.error('OCR Error:', error);
      throw new Error('Failed to process the image');
    }
  };

  const findMatchingProducts = async (text: string) => {
    try {
      // Get all products
      const { data: products, error } = await supabase
        .from('products')
        .select('*');

      if (error) throw error;

      // Filter products based on text match
      const matches = products?.filter(product => {
        const productNameLower = product.name.toLowerCase();
        const matches = text.includes(productNameLower);
        return matches;
      }) || [];

      return matches;
    } catch (error) {
      console.error('Error finding matching products:', error);
      return [];
    }
  };

  const validatePrescription = (text: string) => {
    const requiredKeywords = ['prescription', 'doctor', 'medication'];
    const foundKeywords = requiredKeywords.filter(keyword => text.includes(keyword));
    return {
      isValid: foundKeywords.length >= 2,
      foundKeywords
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select a prescription file to upload"
      });
      return;
    }

    setIsVerifying(true);
    setOcrProgress(0);
    setMatchingProducts([]);

    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to add items to cart",
        });
        setIsVerifying(false);
        return;
      }

      // Perform OCR
      const text = await performOCR(file);
      setExtractedText(text);
      
      const { isValid, foundKeywords } = validatePrescription(text);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('prescriptions')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Save prescription record 
      const { error: dbError } = await supabase
        .from('prescriptions')
        .insert({
          user_id: user.id,
          file_url: uploadData.path,
          medicine_name: productName || 'general',
          status: isValid ? 'verified' : 'rejected'
        });

      if (dbError) throw dbError;

      // Find matching products from the extracted text
      const matches = await findMatchingProducts(text);
      setMatchingProducts(matches);

      if (isValid) {
        // If a specific product was selected and the prescription is valid
        if (productId) {
          // Add to cart - using the new cart_items table
          try {
            const { error: cartError } = await supabase
              .from('cart_items')
              .insert({
                user_id: user.id,
                product_id: productId,
                quantity: 1,
              });

            if (cartError) {
              console.error("Cart error:", cartError);
              // Don't throw, just log the error
            } else {
              toast({
                title: "Success",
                description: "Product added to cart",
              });
            }
          } catch (cartError) {
            console.error("Failed to add to cart:", cartError);
          }
        }

        setVerificationResult({
          success: true,
          message: matches.length > 0 
            ? "Prescription verified successfully. We found matching medicines!"
            : "Prescription verified successfully."
        });
      } else {
        setVerificationResult({
          success: false,
          message: `Invalid prescription. Missing required elements. Found keywords: ${foundKeywords.join(', ')}`
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to verify prescription",
      });
      setVerificationResult({
        success: false,
        message: "Failed to process prescription"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleProductSelect = (product: any) => {
    navigate('/prescription', { 
      state: { 
        productId: product.id,
        productName: product.name,
        price: product.price
      } 
    });
  };

  const addToCart = async (product: any) => {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to add items to cart",
        });
        return;
      }

      // Add product to cart
      const { error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          product_id: product.id,
          quantity: 1
        });

      if (error) {
        console.error("Cart error:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to add product to cart",
        });
        return;
      }

      toast({
        title: "Success",
        description: `${product.name} added to cart`,
      });
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Verify Prescription</CardTitle>
        </CardHeader>
        <CardContent>
          {productName && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium">Selected Product:</h3>
              <p>{productName}</p>
              <p className="text-primary font-medium">${price?.toFixed(2)}</p>
            </div>
          )}

          {verificationResult && (
            <Alert className={`mb-4 ${verificationResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>
                {verificationResult.success ? 'Verification Successful' : 'Verification Failed'}
              </AlertTitle>
              <AlertDescription>
                {verificationResult.message}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <label 
                htmlFor="prescription" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Upload your prescription (PDF or Image)
              </label>
              <Input
                id="prescription"
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileChange}
                className="cursor-pointer"
                disabled={isVerifying}
                ref={fileInputRef}
              />
              {isVerifying && ocrProgress > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${ocrProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={!file || isVerifying}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {ocrProgress > 0 ? `Processing (${ocrProgress}%)` : 'Verifying...'}
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Verify Prescription
                </>
              )}
            </Button>
          </form>

          {matchingProducts.length > 0 && (
            <div className="mt-6">
              <h3 className="text-md font-medium mb-2">Matching Medicines Found:</h3>
              <div className="space-y-2">
                {matchingProducts.map(product => (
                  <div 
                    key={product.id} 
                    className="p-3 border rounded-md flex justify-between items-center hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">${product.price.toFixed(2)}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleProductSelect(product)}
                      >
                        <Search className="h-4 w-4 mr-1" /> View
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => addToCart(product)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" /> Add to Cart
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Prescription;
