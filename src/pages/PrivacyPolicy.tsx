import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const PrivacyPolicy = () => {
  return (
    <>
      <SEOHead title="Privacy Policy – NoteCash" description="Learn how NoteCash collects, uses, and protects your personal information." />
      <Navbar />
      <main className="min-h-screen bg-background pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: February 11, 2026</p>

          <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-foreground/90">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
              <p><strong>Account Information:</strong> Name, email address, and password when you register.</p>
              <p><strong>KYC Information:</strong> PAN card number, bank account details (account number, IFSC code, bank name) when you request withdrawals.</p>
              <p><strong>Usage Data:</strong> Pages visited, notes viewed/downloaded, device information, IP address, and browser type.</p>
              <p><strong>Uploaded Content:</strong> Notes, documents, and files you upload to the Platform.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>To create and manage your account.</li>
                <li>To process earnings and facilitate withdrawals.</li>
                <li>To personalize your experience and recommend relevant notes.</li>
                <li>To detect and prevent fraud, abuse, and policy violations.</li>
                <li>To communicate important updates and notifications.</li>
                <li>To improve the Platform's features and performance.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Data Sharing</h2>
              <p>We do not sell your personal information. We may share data with:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Payment Processors:</strong> To process withdrawals (e.g., Razorpay).</li>
                <li><strong>Service Providers:</strong> Cloud hosting, analytics, and security services.</li>
                <li><strong>Legal Authorities:</strong> When required by law or to protect our rights.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Data Security</h2>
              <p>We implement industry-standard security measures including encryption, secure servers, and access controls. KYC data is encrypted at rest. However, no method of transmission over the Internet is 100% secure.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Data Retention</h2>
              <p>We retain your data for as long as your account is active. Upon account deletion, personal data will be removed within 30 days, except where retention is required by law.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Your Rights</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Access and download your personal data.</li>
                <li>Correct inaccurate information.</li>
                <li>Delete your account and associated data.</li>
                <li>Opt out of non-essential communications.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Cookies</h2>
              <p>We use essential cookies for authentication and session management. Analytics cookies help us understand Platform usage. You can disable non-essential cookies in your browser settings.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Children's Privacy</h2>
              <p>NoteCash is not intended for children under 13. We do not knowingly collect data from children under 13.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Changes to This Policy</h2>
              <p>We may update this policy periodically. We will notify you of significant changes via email or Platform notification.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Contact</h2>
              <p>For privacy-related inquiries, contact us at <a href="mailto:privacy@notecash.com" className="text-primary hover:underline">privacy@notecash.com</a>.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default PrivacyPolicy;
