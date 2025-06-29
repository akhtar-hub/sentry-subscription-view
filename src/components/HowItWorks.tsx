
import { Plug, MagicWand, Dashboard } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: Plug,
      title: "Securely Connect Your Inbox",
      description: "Sign in with your Google or Microsoft account. We use read-only access to find subscription emails. Your data is encrypted and private."
    },
    {
      icon: MagicWand,
      title: "We Find Everything",
      description: "Our AI scans for receipts and invoices from services like Netflix, Spotify, gym memberships, and more."
    },
    {
      icon: Dashboard,
      title: "Take Back Control",
      description: "See all your subscriptions in one simple dashboard. Track spending, get renewal alerts, and never overpay again."
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            See Your Full Subscription Picture in{" "}
            <span className="text-primary">60 Seconds</span>
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
              <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
