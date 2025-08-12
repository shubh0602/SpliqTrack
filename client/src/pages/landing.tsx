import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-cred-dark text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cred-purple/20 via-transparent to-cred-blue/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            <div className="mb-8">
              <h1 className="text-6xl md:text-8xl font-bold bg-cred-gradient bg-clip-text text-transparent mb-4">
                Spliq
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-2">
                Split Quick, Pay Smart
              </p>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                The modern way to split expenses with friends. Track, split, and settle up with ease.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="bg-cred-gradient hover:opacity-90 px-8 py-6 text-lg font-medium rounded-xl"
              >
                Get Started
              </Button>
              <Button 
                variant="outline" 
                className="border-gray-600 text-white hover:bg-gray-800 px-8 py-6 text-lg rounded-xl"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose Spliq?
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Experience the future of expense sharing with our premium features
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-dark-gradient border-gray-800">
            <CardHeader>
              <div className="w-12 h-12 bg-cred-gradient rounded-xl flex items-center justify-center mb-4">
                <i className="fas fa-lightning-bolt text-white text-xl"></i>
              </div>
              <CardTitle className="text-white">Lightning Fast</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                Add expenses and split bills in seconds. Our intuitive interface makes expense tracking effortless.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-dark-gradient border-gray-800">
            <CardHeader>
              <div className="w-12 h-12 bg-green-gradient rounded-xl flex items-center justify-center mb-4">
                <i className="fas fa-users text-white text-xl"></i>
              </div>
              <CardTitle className="text-white">Smart Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                Create groups for trips, households, or events. Keep track of shared expenses with ease.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-dark-gradient border-gray-800">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                <i className="fas fa-chart-line text-white text-xl"></i>
              </div>
              <CardTitle className="text-white">Real-time Balances</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                Always know who owes what. Our smart algorithm calculates and simplifies debts automatically.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-cred-gray border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust Spliq to manage their shared expenses
            </p>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-cred-gradient hover:opacity-90 px-12 py-6 text-lg font-medium rounded-xl"
            >
              Sign Up Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
