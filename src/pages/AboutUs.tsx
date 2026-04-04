import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Users, IndianRupee, GraduationCap, Heart, Shield } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const AboutUs = () => {
  return (
    <>
      <SEOHead
        title="About Us – NoteCash"
        description="Learn about NoteCash — the platform where students earn money by sharing quality study notes with millions of learners."
      />
      <Navbar />
      <main className="min-h-screen bg-background pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold mb-2">About NoteCash</h1>
          <p className="text-lg text-muted-foreground mb-10">Empowering students to learn, share, and earn.</p>

          <div className="space-y-10 text-foreground/90">
            {/* Mission */}
            <section className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Our Mission</h2>
              </div>
              <p className="leading-relaxed">
                NoteCash was born from a simple idea — <strong>every student's hard work deserves recognition and reward</strong>. 
                We believe that the notes you spend hours creating shouldn't just sit in your notebook. They can help thousands 
                of students across India while earning you real money.
              </p>
            </section>

            {/* What We Do */}
            <section className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">What We Do</h2>
              </div>
              <p className="leading-relaxed mb-4">
                NoteCash is a platform where students can upload their handwritten or digital study notes and earn money 
                every time someone views or downloads them. Whether you're in Class 10, preparing for JEE/NEET, or 
                pursuing B.Tech — your notes have value here.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-primary">•</span>
                  Upload notes in PDF, JPG, or PNG format
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-primary">•</span>
                  Browse and download quality notes for free
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-primary">•</span>
                  Earn real money through views, downloads, and referrals
                </li>
              </ul>
            </section>

            {/* How Earnings Work */}
            <section className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <IndianRupee className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">How You Earn</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-muted p-4 text-center">
                  <p className="text-2xl font-bold text-primary">₹0.25</p>
                  <p className="text-xs text-muted-foreground mt-1">Per Download</p>
                </div>
                <div className="rounded-lg bg-muted p-4 text-center">
                  <p className="text-2xl font-bold text-primary">₹50</p>
                  <p className="text-xs text-muted-foreground mt-1">Bonus at 1,000 Views</p>
                </div>
                <div className="rounded-lg bg-muted p-4 text-center">
                  <p className="text-2xl font-bold text-primary">₹1</p>
                  <p className="text-xs text-muted-foreground mt-1">Per Referral</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                After the first 1,000 views milestone, you earn ₹10 for every additional 1,000 views. 
                Withdraw your earnings directly to your bank account after KYC verification.
              </p>
            </section>

            {/* Who We Serve */}
            <section className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Built for Students</h2>
              </div>
              <p className="leading-relaxed">
                NoteCash serves students across all levels — from CBSE & ICSE board exams to competitive exams like 
                JEE, NEET, UPSC, and university courses like B.Tech, BCA, and MBA. No matter what you study, your 
                notes can make a difference for someone else.
              </p>
            </section>

            {/* Community */}
            <section className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Our Community</h2>
              </div>
              <p className="leading-relaxed">
                We're building a community of student creators who believe in the power of sharing knowledge. 
                Every note uploaded helps another student prepare better, and every download rewards the creator. 
                It's a win-win ecosystem built by students, for students.
              </p>
            </section>

            {/* Trust & Safety */}
            <section className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Trust & Safety</h2>
              </div>
              <p className="leading-relaxed">
                Every uploaded note goes through a review process to ensure quality and originality. We take copyright 
                seriously — plagiarized or inappropriate content is removed immediately. Your KYC data and bank details 
                are encrypted and handled with the highest security standards.
              </p>
            </section>

            {/* Contact */}
            <section className="rounded-xl border border-border bg-card p-6 text-center">
              <h2 className="text-xl font-semibold mb-2">Get in Touch</h2>
              <p className="text-muted-foreground mb-4">Have questions, feedback, or want to partner with us?</p>
              <a href="mailto:support@notecash.com" className="text-primary font-medium hover:underline">
                support@notecash.com
              </a>
              <div className="flex justify-center gap-4 mt-4 text-sm text-muted-foreground">
                <Link to="/terms" className="hover:text-primary">Terms</Link>
                <Link to="/privacy" className="hover:text-primary">Privacy</Link>
                <Link to="/guidelines" className="hover:text-primary">Upload Policy</Link>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default AboutUs;
