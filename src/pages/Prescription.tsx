import { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Loader2,
  AlertCircle,
  Search,
  ShoppingCart,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { createWorker } from "tesseract.js";

const Prescription = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [matchingProducts, setMatchingProducts] = useState<any[]>([]);
  const [extractedText, setExtractedText] = useState<string>("");
  const [addingToCart, setAddingToCart] = useState<string | null>(null); // Track which product is being added

  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { productId, productName, price } = location.state || {};
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (
        selectedFile.type === "application/pdf" ||
        selectedFile.type.startsWith("image/")
      ) {
        setFile(selectedFile);
        setVerificationResult(null);
        setMatchingProducts([]);
      } else {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload a PDF or image file",
        });
      }
    }
  };

  const performOCR = async (imageFile: File) => {
    const worker = await createWorker("eng");
    try {
      const result = await worker.recognize(imageFile);
      await worker.terminate();
      return result.data.text.toLowerCase();
    } catch (error) {
      console.error("OCR Error:", error);
      throw new Error("Failed to process the image");
    }
  };

  const findMatchingProducts = async (text: string) => {
    try {
      const { data: products, error } = await supabase
        .from("products")
        .select("*");

      if (error) throw error;

      const matches =
        products?.filter((product) =>
          text.includes(product.name.toLowerCase())
        ) || [];

      return matches;
    } catch (error) {
      console.error("Error finding matching products:", error);
      return [];
    }
  };

  const validatePrescription = (text: string) => {
    const requiredKeywords = ["prescription", "doctor", "medication"];
    const foundKeywords = requiredKeywords.filter((k) => text.includes(k));
    return {
      isValid: foundKeywords.length >= 2,
      foundKeywords,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select a prescription file to upload",
      });
      return;
    }

    setIsVerifying(true);
    setOcrProgress(0);
    setMatchingProducts([]);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to add items to cart",
        });
        setIsVerifying(false);
        return;
      }

      const text = await performOCR(file);
      setExtractedText(text);

      const { isValid: keywordValid, foundKeywords } =
        validatePrescription(text);

      const matches = await findMatchingProducts(text);
      setMatchingProducts(matches);

      const isValid = keywordValid || matches.length > 0;

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("prescriptions")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase.from("prescriptions").insert({
        user_id: user.id,
        file_url: uploadData.path,
        medicine_name: productName || "general",
        status: isValid ? "verified" : "rejected",
      });

      if (dbError) throw dbError;

      if (isValid) {
        if (productId) {
          const { error: cartError } = await supabase
            .from("cart_items")
            .insert({
              user_id: user.id,
              product_id: productId,
              quantity: 1,
            });

          if (!cartError) {
            toast({
              title: "Success",
              description: "Product added to cart",
            });
          }
        }

        setVerificationResult({
          success: true,
          message:
            matches.length > 0
              ? "Prescription verified successfully. We found matching medicines!"
              : "Prescription verified successfully.",
        });
      } else {
        setVerificationResult({
          success: false,
          message: `Invalid prescription. Missing required elements. Found keywords: ${foundKeywords.join(
            ", "
          )}`,
        });
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to verify prescription",
      });
      setVerificationResult({
        success: false,
        message: "Failed to process prescription",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleProductSelect = (product: any) => {
    navigate("/prescription", {
      state: {
        productId: product.id,
        productName: product.name,
        price: product.price,
      },
    });
  };

  const addToCart = async (product: any) => {
    // Set loading state for this specific product
    setAddingToCart(product.id);
    
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to add items to cart",
        });
        return;
      }

      // Check if item already exists in cart
      const { data: existingItem, error: checkError } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user.id)
        .eq("product_id", product.id)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116 is "not found" error, which is expected if item doesn't exist
        throw checkError;
      }

      if (existingItem) {
        // Update quantity if item exists
        const { error: updateError } = await supabase
          .from("cart_items")
          .update({ quantity: existingItem.quantity + 1 })
          .eq("id", existingItem.id);

        if (updateError) {
          throw updateError;
        }

        toast({
          title: "Success",
          description: `${product.name} quantity updated in cart`,
        });
      } else {
        // Insert new item if it doesn't exist
        const { error: insertError } = await supabase
          .from("cart_items")
          .insert({
            user_id: user.id,
            product_id: product.id,
            quantity: 1,
          });

        if (insertError) {
          throw insertError;
        }

        toast({
          title: "Success",
          description: `${product.name} added to cart`,
        });
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
      
      // Provide more specific error messages
      let errorMessage = "An unexpected error occurred";
      
      if (error.code === "23505") {
        errorMessage = "This item is already in your cart";
      } else if (error.code === "23503") {
        errorMessage = "Product not found";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setAddingToCart(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-xl mx-auto shadow-xl hover:shadow-2xl rounded-2xl transition-shadow">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800">
            Verify Your Prescription
          </CardTitle>
        </CardHeader>

        <CardContent>
          {productName && (
            <div className="mb-4 p-4 bg-muted/20 border rounded-lg space-y-1">
              <h3 className="font-semibold text-gray-800">Selected Product</h3>
              <p className="text-gray-600">{productName}</p>
              <p className="text-primary font-semibold">
                ${price?.toFixed(2)}
              </p>
            </div>
          )}

          {verificationResult && (
            <Alert
              className={`mb-4 rounded-lg border ${
                verificationResult.success
                  ? "bg-green-50 border-green-400 text-green-800"
                  : "bg-red-50 border-red-400 text-red-800"
              }`}
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-semibold">
                {verificationResult.success
                  ? "Verification Successful"
                  : "Verification Failed"}
              </AlertTitle>
              <AlertDescription>
                {verificationResult.message}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid w-full items-start gap-2">
              <label
                htmlFor="prescription"
                className="text-sm font-medium text-gray-700"
              >
                Upload your prescription
                <span className="block text-xs text-muted-foreground">
                  (PDF or image format)
                </span>
              </label>
              <Input
                id="prescription"
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileChange}
                className="cursor-pointer file:cursor-pointer file:mr-4 file:rounded-md file:border-none file:bg-primary file:text-white file:px-4"
                disabled={isVerifying}
                ref={fileInputRef}
              />

              {isVerifying && ocrProgress > 0 && (
                <div className="w-full bg-gray-100 rounded-full h-3 mt-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full transition-all duration-500 ease-in-out"
                    style={{ width: `${ocrProgress}%` }}
                  />
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full shadow-sm hover:shadow-md transition duration-300"
              disabled={!file || isVerifying}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {ocrProgress > 0
                    ? `Processing (${ocrProgress}%)`
                    : "Verifying..."}
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
              <h3 className="text-md font-semibold text-gray-800 mb-2">
                Matching Medicines Found:
              </h3>
              <div className="space-y-3">
                {matchingProducts.map((product) => (
                  <div
                    key={product.id}
                    className="p-4 border rounded-lg bg-white flex justify-between items-center hover:shadow-sm transition"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">
                        ${product.price.toFixed(2)}
                      </p>
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
                        disabled={addingToCart === product.id}
                      >
                        {addingToCart === product.id ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <ShoppingCart className="h-4 w-4 mr-1" />
                        )}
                        {addingToCart === product.id ? "Adding..." : "Add"}
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