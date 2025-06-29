
import { Key, Search, LayoutDashboard } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: Key,
      title: "You Authorize Access",
      description: "Sign in directly with Google or Microsoft's secure system. This grants temporary, read-only permission for our assistant to perform a single, specific job."
    },
    {
      icon: Search,
      title: "It Recognizes Financial Signatures",
      description: "Our automated assistant is trained to recognize only the digital signatures of receipts and invoices. It is blind to the content of personal emails, which are automatically skipped."
    },
    {
      icon: LayoutDashboard,
      title: "Your Dashboard is Built",
      description: "All identified subscriptions are neatly cataloged in your private dashboard. See your spending, get renewal alerts, and finally take back control."
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Your Subscriptions,{" "}
            <span className="text-primary">Instantly Cataloged</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <div key={index} className="text-center group">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                  <step.icon className="w-10 h-10 text-primary" />
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/30 to-transparent transform translate-x-1/2"></div>
                )}
              </div>
              
              <h3 className="text-xl font-semibold text-foreground mb-4">
                {step.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto font-normal">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Urgency Alert */}
        <div className="mt-16 max-w-2xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 bg-red-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  <strong className="font-semibold">Real scenario:</strong> Sarah discovered she was paying $47/month for a gym membership she hadn't used in 8 months. That's $376 down the drain. <span className="font-medium">Don't be like Sarah.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
