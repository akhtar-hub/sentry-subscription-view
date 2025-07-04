
const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using SubSentry, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Description of Service</h2>
              <p className="text-gray-700 mb-4">
                SubSentry is a subscription management service that helps you track and manage your recurring payments by scanning your Gmail inbox for subscription-related emails.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">User Responsibilities</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Provide accurate and up-to-date information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Use the service in compliance with applicable laws</li>
                <li>Not attempt to reverse engineer or hack the service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Gmail Access</h2>
              <p className="text-gray-700 mb-4">
                By using our service, you grant us permission to access your Gmail inbox to scan for subscription-related emails. We will only use this access for the intended purpose of identifying your subscriptions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibent text-gray-900 mb-4">Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                SubSentry is provided "as is" without any guarantees. We are not liable for any damages resulting from the use of our service, including but not limited to missed payments or inaccurate subscription information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Termination</h2>
              <p className="text-gray-700 mb-4">
                You may terminate your account at any time. We reserve the right to terminate accounts that violate these terms of service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify these terms at any time. Users will be notified of significant changes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <p className="text-gray-700">
                For questions about these Terms of Service, contact us at legal@subsentry.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
