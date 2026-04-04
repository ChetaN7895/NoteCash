import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const UploadPolicy = () => {
  return (
    <>
      <SEOHead title="Upload & Content Policy – NoteCash" description="Guidelines for uploading notes on NoteCash. Learn what content is allowed and how we review uploads." />
      <Navbar />
      <main className="min-h-screen bg-background pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold mb-2">Upload & Content Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: February 11, 2026</p>

          <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-foreground/90">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. What You Can Upload</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Original handwritten or typed notes you have created.</li>
                <li>Study guides, summaries, and revision materials.</li>
                <li>Practice questions and solutions you have authored.</li>
                <li>Diagrams, flowcharts, and mind maps of your own creation.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. What You Cannot Upload</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Copyrighted material:</strong> Textbook pages, published articles, or content owned by others.</li>
                <li><strong>Exam papers:</strong> Official question papers or answer keys from institutions.</li>
                <li><strong>Plagiarized content:</strong> Notes copied from other sources without permission.</li>
                <li><strong>Inappropriate content:</strong> Offensive, hateful, violent, or sexually explicit material.</li>
                <li><strong>Spam or low-quality content:</strong> Blank pages, unreadable scans, or irrelevant files.</li>
                <li><strong>Malicious files:</strong> Files containing viruses, malware, or executable code.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. File Requirements</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Supported formats: PDF, JPG, PNG.</li>
                <li>Maximum file size: 10 MB per file.</li>
                <li>Notes must be legible and well-organized.</li>
                <li>Each upload must include a descriptive title, subject, and class level.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Review Process</h2>
              <p>All uploaded notes go through a review process:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Automated checks:</strong> File format, size, and basic quality screening.</li>
                <li><strong>Content review:</strong> Verification for originality and appropriateness.</li>
                <li><strong>Approval/Rejection:</strong> You will be notified of the result. Rejected notes will include a reason.</li>
              </ul>
              <p>Review typically takes less than 24 hours.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Earnings from Uploads</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>₹0.25 per download of your approved notes.</li>
                <li>₹50 bonus when your note reaches 1,000 views.</li>
                <li>₹10 for every additional 1,000 views thereafter.</li>
                <li>Earnings are only credited for approved, original content.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Copyright Infringement</h2>
              <p>If you believe content on NoteCash infringes your copyright, please contact us at <a href="mailto:copyright@notecash.com" className="text-primary hover:underline">copyright@notecash.com</a> with:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Description of the copyrighted work.</li>
                <li>Link to the infringing content on NoteCash.</li>
                <li>Your contact information and a statement of good faith.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Consequences of Violations</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>First offense:</strong> Content removal and warning.</li>
                <li><strong>Second offense:</strong> Temporary account suspension (7 days).</li>
                <li><strong>Third offense:</strong> Permanent account ban and forfeiture of earnings.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Contact</h2>
              <p>For questions about this policy, contact us at <a href="mailto:support@notecash.com" className="text-primary hover:underline">support@notecash.com</a>.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default UploadPolicy;
