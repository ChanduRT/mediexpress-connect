import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="container mx-auto px-4 pt-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Trusted Partner for Online Medical Products
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Discover amazing products at great prices with secure delivery right to your doorstep
          </p>
          <Button
            className="bg-primary hover:bg-primary-hover text-white px-8 py-6 rounded-full text-lg transition-all duration-300 transform hover:scale-105"
          >
            Shop Now
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;