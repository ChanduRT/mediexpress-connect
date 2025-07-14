import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Shield, Clock } from "lucide-react";

const Hero = () => {
  const floatingElements = [
    { emoji: "👨‍⚕️", x: "10%", y: "20%", delay: 0 },
    { emoji: "👩‍⚕️", x: "85%", y: "15%", delay: 0.2 },
    { emoji: "🚚", x: "15%", y: "70%", delay: 0.4 },
    { emoji: "💊", x: "80%", y: "65%", delay: 0.6 },
    { emoji: "🩺", x: "25%", y: "45%", delay: 0.8 },
    { emoji: "🏥", x: "75%", y: "35%", delay: 1 },
    { emoji: "📦", x: "5%", y: "55%", delay: 1.2 },
    { emoji: "⚡", x: "90%", y: "50%", delay: 1.4 },
  ];

  const stats = [
    { icon: Star, value: "50K+", label: "Happy Customers" },
    { icon: Shield, value: "100%", label: "Secure Delivery" },
    { icon: Clock, value: "24/7", label: "Support Available" },
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {floatingElements.map((element, index) => (
          <motion.div
            key={index}
            className="absolute text-4xl md:text-6xl opacity-20 select-none"
            style={{ left: element.x, top: element.y }}
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{ 
              opacity: 0.2, 
              scale: 1, 
              rotate: 0,
              y: [0, -20, 0],
            }}
            transition={{
              duration: 0.8,
              delay: element.delay,
              y: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }
            }}
          >
            {element.emoji}
          </motion.div>
        ))}
      </div>

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 pt-20 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-2 mb-6 shadow-lg"
          >
            <span className="text-2xl">🎯</span>
            <span className="text-sm font-medium text-primary">Trusted by 50,000+ customers</span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight"
          >
            Your Trusted Partner for{" "}
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Online Medical Products
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            <span className="text-2xl mr-2">🚀</span>
            Discover amazing medical products at great prices with{" "}
            <span className="text-2xl mx-1">🔒</span>
            secure delivery right to your doorstep
            <span className="text-2xl ml-2">🏠</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Button
              className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary-hover hover:to-blue-700 text-white px-8 py-6 rounded-full text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 group"
              onClick={() => window.location.href = "/products"}
            >
              <span className="text-xl">🛒</span>
              Shop Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button
              variant="outline"
              className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-6 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
              onClick={() => window.location.href = "/book-appointment"}
            >
              <span className="text-xl">👨‍⚕️</span>
              Book Appointment
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-center mb-2">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-1 h-3 bg-primary rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Hero;