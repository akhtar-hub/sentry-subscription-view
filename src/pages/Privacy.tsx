
const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
              <p className="text-gray-700 mb-4">
                SubSentry ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our subscription management service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Personal Information</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Email address and name (via Google OAuth)</li>
                  <li>Profile picture (if provided via Google)</li>
                  <li>Subscription information you manually add</li>
                </ul>
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Gmail Data</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>We access your Gmail inbox to scan for subscription-related emails</li>
                  <li>We only read email metadata and content to identify subscription services</li>
                  <li>We do not store your email content permanently</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>To provide and maintain our subscription management service</li>
                <li>To identify and track your subscriptions</li>
                <li>To send you notifications about upcoming payments</li>
                <li>To improve our service and user experience</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
              <p className="text-gray-700 mb-4">
                We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. We use industry-standard encryption and secure authentication methods.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Services</h2>
              <p className="text-gray-700 mb-4">
                We use Google OAuth for authentication and Gmail API for email scanning. Your data is subject to Google's privacy policies when using these services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Access your personal data</li>
                <li>Update or correct your information</li>
                <li>Delete your account and associated data</li>
                <li>Withdraw consent for Gmail access</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions about this Privacy Policy, please contact us at privacy@subsentry.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
