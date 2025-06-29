
const Features = () => {
  const features = [
    {
      title: "All Your Subscriptions, One View",
      subtitle: "The Unified Dashboard",
      description: "No more hunting through bank statements. See every recurring payment, its cost, and its next renewal date at a glance."
    },
    {
      title: "Never Get Surprised by a Bill Again",
      subtitle: "Smart Renewal Alerts",
      description: "We'll email you before any subscription renews, giving you time to decide if you still need it."
    },
    {
      title: "Your Dashboard, Your Rules",
      subtitle: "Manual Control",
      description: "Easily add subscriptions we might have missed or track offline payments like your gym membership manually."
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="space-y-16">
          {features.map((feature, index) => (
            <div key={index} className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12`}>
              <div className="flex-1">
                <div className="max-w-lg">
                  <div className="text-sm font-medium text-primary mb-2">
                    {feature.subtitle}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">
                    {feature.title}
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                  <div className="space-y-4">
                    {index === 0 && (
                      <>
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-red-500 rounded-lg"></div>
                            <div>
                              <div className="font-medium">Netflix</div>
                              <div className="text-sm text-gray-500">Entertainment</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">$15.49</div>
                            <div className="text-sm text-gray-500">Monthly</div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-500 rounded-lg"></div>
                            <div>
                              <div className="font-medium">Spotify</div>
                              <div className="text-sm text-gray-500">Music</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">$9.99</div>
                            <div className="text-sm text-gray-500">Monthly</div>
                          </div>
                        </div>
                        <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/20">
                          <div className="font-medium text-secondary">Total: $25.48/month</div>
                        </div>
                      </>
                    )}
                    
                    {index === 1 && (
                      <div className="space-y-3">
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                            <div className="font-medium text-yellow-800">Renewal Alert</div>
                          </div>
                          <div className="text-sm text-yellow-700">Adobe Creative Suite renews in 3 days for $52.99</div>
                        </div>
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            <div className="font-medium text-blue-800">Upcoming</div>
                          </div>
                          <div className="text-sm text-blue-700">Gym membership renews in 1 week for $29.99</div>
                        </div>
                      </div>
                    )}
                    
                    {index === 2 && (
                      <div className="space-y-4">
                        <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                          <div className="text-gray-400 mb-2">+ Add Manual Subscription</div>
                          <div className="text-sm text-gray-500">Track offline payments</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="font-medium">Local Gym Membership</div>
                          <div className="text-sm text-gray-500">Manually added • $29.99/month</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
