
import { Button } from "@/components/ui/button";

const FinalCTA = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/5 to-secondary/5">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
          Ready to Plug the Leaks in Your <span className="text-primary">Budget?</span>
        </h2>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto font-normal">
          It takes less than a minute to start finding savings.
        </p>
        <Button 
          size="lg" 
          className="text-lg px-8 py-4 bg-secondary hover:bg-secondary/90 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          Sign Up for Free
        </Button>
        
        <div className="mt-8 text-sm text-muted-foreground font-normal">
          No credit card required • Free forever plan available
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
