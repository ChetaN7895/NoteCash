import { motion } from "framer-motion";
import SEOHead from "@/components/SEOHead";
import { Link } from "react-router-dom";
import {
  Upload,
  Eye,
  IndianRupee,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Trophy,
  Shield,
  Zap,
  Star,
  Quote,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatsCounter from "@/components/StatsCounter";
import NoteCard from "@/components/NoteCard";
import FeaturedNotes from "@/components/FeaturedNotes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useHomePageData } from "@/hooks/useHomePageData";
import NoteCardSkeleton from "@/components/skeletons/NoteCardSkeleton";

const Index = () => {
  const { topNotes, featuredNotes, categoryCounts, stats, isLoading } = useHomePageData();

  // Default categories with icons - counts will be updated from real data
  const categoryConfig = [
    { name: "Class 10-12", icon: BookOpen },
    { name: "B.Tech", icon: GraduationCap },
    { name: "BCA/MCA", icon: Zap },
    { name: "MBA", icon: Trophy },
    { name: "Competitive Exams", icon: Star },
    { name: "Other", icon: Shield },
  ];

  // Merge real counts with category config
  const categories = categoryConfig.map(cat => {
    const found = categoryCounts.find(c => c.name === cat.name);
    return {
      ...cat,
      count: found?.count || 0,
    };
  });

  const howItWorks = [
    {
      step: 1,
      title: "Upload Your Notes",
      description: "Share your handwritten or digital notes with students worldwide.",
      icon: Upload,
    },
    {
      step: 2,
      title: "Get Views & Downloads",
      description: "Other students discover and download your quality notes.",
      icon: Eye,
    },
    {
      step: 3,
      title: "Earn Money",
      description: "Get ₹50 for your first 1000 views, then ₹10 per 1000 views + ₹25 per 100 downloads. Withdraw at ₹500!",
      icon: IndianRupee,
    },
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "B.Tech Student, IIT Delhi",
      avatar: "PS",
      content: "I uploaded my Data Structures notes and earned ₹15,000 in just 3 months! The platform is super easy to use and payments are always on time.",
      earnings: "₹15,000+",
      isVerified: true,
    },
    {
      name: "Rahul Kumar",
      role: "Class 12, CBSE",
      avatar: "RK",
      content: "My Physics notes helped thousands of students. It feels great to earn while helping others prepare for their exams!",
      earnings: "₹8,500+",
      isVerified: true,
    },
    {
      name: "Ananya Gupta",
      role: "MBA Student, IIM Bangalore",
      avatar: "AG",
      content: "NoteCash changed how I view my study materials. My marketing case studies are now earning passive income every month.",
      earnings: "₹22,000+",
      isVerified: true,
    },
    {
      name: "Vikram Singh",
      role: "UPSC Aspirant",
      avatar: "VS",
      content: "I found amazing notes for my preparation and also started uploading my own summaries. Win-win for everyone!",
      earnings: "₹5,200+",
      isVerified: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead />
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background gradient */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" 
        />
        
        {/* Animated shapes */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.3 }}
          className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" 
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" 
          style={{ animationDelay: "1s" }} 
        />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm">
                <Star className="w-4 h-4 mr-2 fill-highlight text-highlight" />
                Join 100,000+ students earning from their notes
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            >
              Upload Notes.{" "}
              <span className="text-gradient">Earn Money.</span>
              <br />
              Help Students.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Share your study notes with millions of students and earn money for every view. 
              Quality notes that help others succeed.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/upload">
                <Button variant="hero" size="xl" className="w-full sm:w-auto group">
                  <Upload className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
                  Upload Notes
                </Button>
              </Link>
              <Link to="/browse">
                <Button variant="outline" size="xl" className="w-full sm:w-auto group">
                  Browse Notes
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </motion.div>

            {/* Earnings preview */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mt-12 inline-flex items-center gap-6 bg-card rounded-2xl p-4 shadow-card border"
            >
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                  <Eye className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-muted-foreground">1000 Views</span>
                <span className="font-semibold">=</span>
                <span className="font-bold text-accent">₹50</span>
              </div>
              <div className="w-px h-6 bg-border" />
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">100 Downloads</span>
                <span className="font-semibold">=</span>
                <span className="font-bold text-accent">₹50</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <StatsCounter 
        totalNotes={stats.totalNotes}
        totalEarningsPaid={stats.totalEarningsPaid}
        activeStudents={stats.activeStudents}
        totalDownloads={stats.totalDownloads}
      />

      {/* Featured Notes */}
      <FeaturedNotes notes={featuredNotes} isLoading={isLoading} />

      {/* Categories */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Browse by Category
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find notes for your subject and level. From school to competitive exams.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={`/browse?category=${encodeURIComponent(category.name)}`}
                  className="block p-6 bg-card rounded-xl border shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 text-center group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                    <category.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{category.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {category.count.toLocaleString()} notes
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Notes */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                Top Rated Notes
              </h2>
              <p className="text-muted-foreground">
                Discover the most popular and highest-rated notes.
              </p>
            </div>
            <Link to="/browse">
              <Button variant="outline">
                View All Notes
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              <>
                <NoteCardSkeleton />
                <NoteCardSkeleton />
                <NoteCardSkeleton />
                <NoteCardSkeleton />
              </>
            ) : topNotes.length > 0 ? (
              topNotes.map((note) => (
                <NoteCard key={note.id} {...note} />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No notes available yet. Be the first to upload!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="secondary" className="mb-4">
              <Star className="w-3 h-3 mr-1 fill-highlight text-highlight" />
              Student Stories
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Loved by Students Nationwide
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of students who are already earning and learning with NoteCash.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="relative bg-card rounded-2xl border p-6 shadow-card hover:shadow-card-hover transition-all duration-300 group"
              >
                {/* Quote icon */}
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full gradient-primary flex items-center justify-center shadow-lg">
                  <Quote className="w-4 h-4 text-primary-foreground" />
                </div>

                {/* Content */}
                <p className="text-muted-foreground text-sm leading-relaxed mb-6 pt-2">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                    {testimonial.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{testimonial.name}</p>
                      {testimonial.isVerified && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{testimonial.role}</p>
                  </div>
                </div>

                {/* Earnings badge */}
                <div className="absolute top-4 right-4">
                  <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-1 rounded-full">
                    {testimonial.earnings}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Start earning from your notes in three simple steps.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative text-center"
              >
                {/* Connection line */}
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-primary/10" />
                )}

                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl gradient-primary mx-auto mb-6 flex items-center justify-center shadow-lg shadow-primary/25 animate-pulse-glow">
                    <item.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-highlight text-highlight-foreground text-sm font-bold flex items-center justify-center">
                    {item.step}
                  </div>
                </div>

                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <Link to="/register">
              <Button variant="hero" size="xl">
                Start Earning Now
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-90" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-20" />
        
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto text-primary-foreground"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Turn Your Notes Into Cash?
            </h2>
            <p className="text-lg opacity-90 mb-8">
              Join thousands of students who are already earning by sharing their knowledge. 
              Your study notes could be helping someone ace their exams.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button
                  size="xl"
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 w-full sm:w-auto"
                >
                  Create Free Account
                </Button>
              </Link>
              <Link to="/browse">
                <Button
                  size="xl"
                  className="bg-primary-foreground/20 border border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/30 w-full sm:w-auto"
                >
                  Explore Notes
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
