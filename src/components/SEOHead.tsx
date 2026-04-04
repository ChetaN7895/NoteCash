import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  canonicalUrl?: string;
}

const SEOHead = ({
  title = 'NoteCash - Upload Notes, Earn Money, Help Students',
  description = 'Share your study notes with millions of students and earn money for every view. Get ₹50 bonus at 1000 views, then ₹10 per 1000 views.',
  keywords = 'study notes, earn money, upload notes, student notes, JEE notes, NEET notes, class 12 notes, B.Tech notes',
  ogImage = '/og-image.png',
  ogType = 'website',
  canonicalUrl,
}: SEOHeadProps) => {
  const fullTitle = title.includes('NoteCash') ? title : `${title} | NoteCash`;
  const url = canonicalUrl || window.location.href;

  return (
    <Helmet>
      {/* Basic Meta */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="NoteCash" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta name="theme-color" content="#6366f1" />
    </Helmet>
  );
};

export default SEOHead;
