
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          {/* Hero Headlines */}
          <div className="animate-fade-in">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Stop Wasting Money on{" "}
              <span className="text-primary">Forgotten Subscriptions</span>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-10 max-w-4xl mx-auto leading-relaxed">
              SubSentry automatically finds all your recurring payments, puts you in control, 
              and saves you money. <span className="font-medium text-foreground">Effortlessly.</span>
            </p>
          </div>

          {/* CTA Button */}
          <div className="mb-16 animate-fade-in">
            <Button 
              size="lg" 
              className="text-lg px-8 py-4 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Find My Subscriptions for Free
            </Button>
          </div>

          {/* Visual Representation */}
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
              <div className="flex items-center justify-center mb-6">
                <div className="w-full max-w-2xl bg-gray-100 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <div className="text-sm text-gray-400">SubSentry Dashboard</div>
                  </div>
                  
                  {/* Subscription Cards Animation */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { name: "Netflix", color: "bg-red-500", delay: "0s" },
                      { name: "Spotify", color: "bg-green-500", delay: "0.2s" },
                      { name: "Adobe", color: "bg-red-600", delay: "0.4s" },
                      { name: "Gym", color: "bg-blue-500", delay: "0.6s" }
                    ].map((subscription, index) => (
                      <div 
                        key={subscription.name}
                        className="bg-white rounded-lg p-4 shadow-md animate-float"
                        style={{ animationDelay: subscription.delay }}
                      >
                        <div className={`w-8 h-8 ${subscription.color} rounded-lg mb-2 mx-auto`}></div>
                        <div className="text-xs font-medium text-center">{subscription.name}</div>
                        <div className="text-xs text-gray-500 text-center">$12.99/mo</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 p-4 bg-secondary/10 rounded-lg border border-secondary/20">
                    <div className="text-sm font-medium text-center text-secondary">
                      Total Monthly: $51.96 • Next Renewal: Tomorrow
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
