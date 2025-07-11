import { motion } from "framer-motion";
import { Truck, Phone, ShoppingCart, User } from "lucide-react";

const services = [
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Quick and reliable delivery service",
  },
  {
    icon: Phone,
    title: "Customer Support",
    description: "24/7 dedicated customer service",
  },
  {
    icon: ShoppingCart,
    title: "Easy Shopping",
    description: "Seamless shopping experience",
  },
  {
    icon: User,
    title: "Personal Account",
    description: "Manage your orders and preferences",
  },
];

const Services = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">Our Services</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <service.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
              <p className="text-gray-600">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;