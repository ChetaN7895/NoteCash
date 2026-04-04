import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const TermsOfService = () => {
  return (
    <>
      <SEOHead title="Terms of Service – NoteCash" description="Read the terms and conditions for using NoteCash." />
      <Navbar />
      <main className="min-h-screen bg-background pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: February 11, 2026</p>

          <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-foreground/90">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p>By accessing or using NoteCash ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Eligibility</h2>
              <p>You must be at least 13 years old to use NoteCash. Users under 18 must have parental or guardian consent. You must provide accurate and complete registration information.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Account Responsibilities</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                <li>You are responsible for all activities under your account.</li>
                <li>You must notify us immediately of any unauthorized use of your account.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Earnings & Withdrawals</h2>
              <p>Earnings are credited based on note views, downloads, and referrals as described on the Platform. Withdrawal of earnings requires completing KYC verification (PAN card and bank details). NoteCash reserves the right to withhold or reverse earnings obtained through fraudulent activity, bot traffic, or violation of these terms. Minimum withdrawal amount is ₹100.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Content Ownership</h2>
              <p>You retain ownership of the notes you upload. By uploading, you grant NoteCash a non-exclusive, worldwide license to display, distribute, and promote your content on the Platform. You must not upload content you do not own or have rights to distribute.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Prohibited Conduct</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Uploading copyrighted, plagiarized, or inappropriate content.</li>
                <li>Using bots, scripts, or artificial means to inflate views or downloads.</li>
                <li>Creating multiple accounts to exploit referral or earning systems.</li>
                <li>Harassing, threatening, or abusing other users.</li>
                <li>Attempting to hack, disrupt, or reverse-engineer the Platform.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Termination</h2>
              <p>NoteCash may suspend or terminate your account at any time for violations of these terms. Upon termination, any pending earnings may be forfeited if the termination is due to policy violations.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
              <p>NoteCash is provided "as is" without warranties. We are not liable for any indirect, incidental, or consequential damages arising from your use of the Platform. Our total liability shall not exceed the amount of earnings credited to your account in the past 12 months.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Changes to Terms</h2>
              <p>We may update these terms at any time. Continued use of the Platform after changes constitutes acceptance of the revised terms.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Contact</h2>
              <p>For questions about these terms, contact us at <a href="mailto:support@notecash.com" className="text-primary hover:underline">support@notecash.com</a>.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default TermsOfService;
