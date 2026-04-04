import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import UploadForm from "@/components/UploadForm";
import { FileText, Coins, Users, Shield } from "lucide-react";

const UploadNotes = () => {
  const benefits = [
    {
      icon: Coins,
      title: "Earn Money",
      description: "Get ₹50 at first 1000 views, then ₹10 per 1000 views",
    },
    {
      icon: Users,
      title: "Help Students",
      description: "Your notes could help thousands of students succeed",
    },
    {
      icon: Shield,
      title: "Quality Check",
      description: "All notes are reviewed to ensure high quality",
    },
    {
      icon: FileText,
      title: "Any Format",
      description: "Upload PDFs or images of handwritten notes",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Upload Your Notes
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Share your study notes and start earning. Help fellow students
                while making money from your hard work.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-2"
              >
                <div className="bg-card rounded-2xl border p-6 md:p-8 shadow-card">
                  <UploadForm />
                </div>
              </motion.div>

              {/* Benefits Sidebar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <h3 className="font-semibold text-lg mb-4">Why Upload?</h3>
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-start gap-4 p-4 bg-card rounded-xl border"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">{benefit.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {benefit.description}
                      </p>
                    </div>
                  </motion.div>
                ))}

                {/* Earnings Calculator */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="p-4 gradient-primary rounded-xl text-primary-foreground"
                >
                  <h4 className="font-semibold mb-2">Earnings Potential</h4>
                  <div className="space-y-2 text-sm opacity-90">
                    <div className="flex justify-between">
                      <span>10,000 views</span>
                      <span className="font-bold">₹1,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>1,000 downloads</span>
                      <span className="font-bold">₹500</span>
                    </div>
                    <div className="border-t border-primary-foreground/20 my-2" />
                    <div className="flex justify-between font-bold">
                      <span>Total Potential</span>
                      <span>₹1,500+</span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UploadNotes;
