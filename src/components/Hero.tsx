
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 px-4 sm:px-6 lg:px-8 pt-16">
      <div className="max-w-7xl mx-auto w-full">
        <div className="text-center">
          {/* SubSentry Logo */}
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">S</span>
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-bold text-foreground">SubSentry</h3>
                <p className="text-sm text-muted-foreground font-medium">Your Money Guardian</p>
              </div>
            </div>
          </div>

          {/* Hero Headlines with Animated Check Lines */}
          <div className="animate-fade-in">
            <div className="relative mb-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Stop Wasting Money on{" "}
                <span className="text-primary relative">
                  Forgotten Subscriptions
                  {/* Animated Check Lines */}
                  <div className="absolute -bottom-2 left-0 w-full h-1 overflow-hidden">
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="w-4 h-1 bg-green-500 animate-pulse"
                          style={{ animationDelay: `${i * 0.2}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </span>
              </h1>
            </div>
            
            {/* Enhanced Key Message */}
            <div className="relative mb-10 max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 rounded-2xl p-6 border border-primary/20">
                <p className="text-lg sm:text-xl lg:text-2xl text-foreground leading-relaxed font-medium">
                  <span className="text-primary font-semibold">SubSentry</span> automatically finds all your recurring payments, 
                  puts you in <span className="text-secondary font-semibold">complete control</span>, 
                  and saves you money. <span className="text-primary font-bold">Effortlessly.</span>
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced CTA Button */}
          <div className="mb-16 animate-fade-in">
            <Button 
              size="lg" 
              className="text-xl px-12 py-6 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-110 border-2 border-white/20"
            >
              🔍 Find My Subscriptions for Free
            </Button>
            <p className="mt-4 text-sm text-muted-foreground font-medium">
              ✨ No credit card required • 🚀 Setup in 60 seconds
            </p>
          </div>

          {/* Visual Representation with Brand Logos */}
          <div className="relative max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-center mb-6">
                <div className="w-full max-w-4xl bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-400 rounded-full animate-pulse"></div>
                      <div className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                      <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                    <div className="text-sm text-gray-500 font-semibold">SubSentry Dashboard</div>
                  </div>
                  
                  {/* Subscription Cards with Real Brand Aesthetics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                    {[
                      { 
                        name: "Netflix", 
                        color: "bg-red-600", 
                        textColor: "text-white",
                        logo: "N", 
                        price: "$15.49",
                        delay: "0s" 
                      },
                      { 
                        name: "Spotify", 
                        color: "bg-green-500", 
                        textColor: "text-white",
                        logo: "♪", 
                        price: "$9.99",
                        delay: "0.2s" 
                      },
                      { 
                        name: "Adobe", 
                        color: "bg-red-500", 
                        textColor: "text-white",
                        logo: "A", 
                        price: "$12.99",
                        delay: "0.4s" 
                      },
                      { 
                        name: "Gym", 
                        color: "bg-blue-500", 
                        textColor: "text-white",
                        logo: "💪", 
                        price: "$13.49",
                        delay: "0.6s" 
                      }
                    ].map((subscription, index) => (
                      <div 
                        key={subscription.name}
                        className="bg-white rounded-xl p-4 sm:p-5 shadow-lg animate-float border border-gray-200 hover:shadow-xl transition-all duration-300"
                        style={{ animationDelay: subscription.delay }}
                      >
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 ${subscription.color} rounded-xl mb-3 mx-auto flex items-center justify-center ${subscription.textColor} font-bold text-lg sm:text-xl shadow-md`}>
                          {subscription.logo}
                        </div>
                        <div className="text-sm sm:text-base font-semibold text-center text-gray-800">{subscription.name}</div>
                        <div className="text-xs sm:text-sm text-primary font-bold text-center">{subscription.price}/mo</div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Enhanced Total Display */}
                  <div className="mt-8 p-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-gray-700 shadow-xl">
                    <div className="flex items-center justify-center space-x-6 text-white">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">💰</span>
                        <div>
                          <div className="text-lg font-bold">Total Monthly</div>
                          <div className="text-2xl font-bold text-red-400">$51.96</div>
                        </div>
                      </div>
                      <div className="w-px h-12 bg-gray-600"></div>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl animate-pulse">⚠️</span>
                        <div>
                          <div className="text-lg font-bold">Next Renewal</div>
                          <div className="text-xl font-bold text-yellow-400">Tomorrow</div>
                        </div>
                      </div>
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
