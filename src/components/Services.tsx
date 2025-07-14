import { motion } from "framer-motion";
import { Truck, Phone, ShoppingCart, User, Clock, Shield, Heart, Zap } from "lucide-react";

const services = [
  {
    icon: Truck,
    emoji: "🚚",
    title: "Fast Delivery",
    description: "Lightning-fast delivery to your doorstep within 24 hours",
    features: ["Same-day delivery", "Real-time tracking", "Free shipping over ₹500"],
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: Phone,
    emoji: "📞",
    title: "24/7 Support",
    description: "Round-the-clock customer support from medical experts",
    features: ["Live chat support", "Medical consultations", "Emergency assistance"],
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
  },
  {
    icon: ShoppingCart,
    emoji: "🛒",
    title: "Easy Shopping",
    description: "Seamless and secure shopping experience with smart recommendations",
    features: ["One-click ordering", "Smart recommendations", "Secure payments"],
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    icon: User,
    emoji: "👤",
    title: "Personal Account",
    description: "Manage your health profile, orders, and prescriptions easily",
    features: ["Health tracking", "Order history", "Prescription management"],
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    icon: Clock,
    emoji: "⏰",
    title: "Quick Refills",
    description: "Automatic prescription refills and medication reminders",
    features: ["Auto-refill", "Medication reminders", "Dosage tracking"],
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-50",
  },
  {
    icon: Shield,
    emoji: "🔒",
    title: "Secure & Safe",
    description: "Bank-level security with verified authentic medicines",
    features: ["SSL encryption", "Authentic products", "Privacy protection"],
    color: "from-indigo-500 to-indigo-600",
    bgColor: "bg-indigo-50",
  },
  {
    icon: Heart,
    emoji: "❤️",
    title: "Health Tracking",
    description: "Monitor your health journey with personalized insights",
    features: ["Health metrics", "Progress tracking", "Personalized tips"],
    color: "from-pink-500 to-pink-600",
    bgColor: "bg-pink-50",
  },
  {
    icon: Zap,
    emoji: "⚡",
    title: "Smart Features",
    description: "AI-powered features for better health management",
    features: ["AI recommendations", "Drug interactions", "Health insights"],
    color: "from-yellow-500 to-yellow-600",
    bgColor: "bg-yellow-50",
  },
];

const Services = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-green-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-4">
            <span className="text-xl">🌟</span>
            <span className="text-sm font-medium text-primary">Our Services</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Why Choose{" "}
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              MediExpress
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            <span className="text-xl mr-2">🎯</span>
            Experience healthcare like never before with our comprehensive range of services
          </p>
        </motion.div>
        
        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              <div className={`p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${service.bgColor}/50 backdrop-blur-sm`}>
                {/* Icon Container */}
                <div className="relative mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                    <service.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 text-2xl animate-bounce">
                    {service.emoji}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {service.description}
                </p>

                {/* Features */}
                <ul className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-gray-500">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Hover Effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-primary to-blue-600 rounded-3xl p-8 text-white shadow-2xl">
            <h3 className="text-2xl font-bold mb-2">
              <span className="text-2xl mr-2">🚀</span>
              Ready to Experience Better Healthcare?
            </h3>
            <p className="text-blue-100 mb-6">
              Join thousands of satisfied customers who trust MediExpress for their health needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-primary px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors shadow-lg">
                <span className="text-lg mr-2">🛒</span>
                Start Shopping
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-primary transition-colors">
                <span className="text-lg mr-2">📞</span>
                Contact Us
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Services;