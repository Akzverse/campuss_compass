import { MapPin, Users, Building2, Compass } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-2 rounded-lg">
                <Compass className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Campus Compass
              </span>
            </div>
            <button
              onClick={onGetStarted}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-8">
            <div className="inline-block">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
                Hackathon Project 2026
              </div>
            </div>

            <h1 className="text-6xl sm:text-7xl font-extrabold text-slate-900 leading-tight">
              Navigate Your Campus
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                With Confidence
              </span>
            </h1>

            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              A Google-powered smart campus navigation system with image-based guidance, role-aware navigation, graph-based pathfinding, and augmented reality visualization.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-200"
              >
                Start Navigating
              </button>
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-white text-slate-700 rounded-xl font-bold text-lg hover:shadow-xl transition-all duration-200 border-2 border-slate-200"
              >
                Learn More
              </button>
            </div>
          </div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100">
              <div className="bg-gradient-to-br from-blue-100 to-cyan-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <MapPin className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Image-Based Navigation</h3>
              <p className="text-slate-600 leading-relaxed">
                Step-by-step guidance using actual campus photographs for intuitive navigation
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100">
              <div className="bg-gradient-to-br from-emerald-100 to-teal-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Role-Aware System</h3>
              <p className="text-slate-600 leading-relaxed">
                Personalized navigation for students, faculty, admin staff, and visitors
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100">
              <div className="bg-gradient-to-br from-violet-100 to-purple-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Building2 className="w-7 h-7 text-violet-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Complete Coverage</h3>
              <p className="text-slate-600 leading-relaxed">
                Navigate academic blocks, labs, offices, and facilities with floor-wise details
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100">
              <div className="bg-gradient-to-br from-amber-100 to-orange-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Compass className="w-7 h-7 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Graph-Based Pathfinding</h3>
              <p className="text-slate-600 leading-relaxed">
                Dijkstra's algorithm with augmented reality 3D visualization
              </p>
            </div>
          </div>
        </section>

        <section id="features" className="bg-white py-20 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Smart Navigation Features
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Advanced engineering with graph-based routing and AR visualization
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <img
                  src="https://images.pexels.com/photos/1454360/pexels-photo-1454360.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Campus building"
                  className="rounded-2xl shadow-2xl"
                />
              </div>
              <div className="space-y-6">
                <h3 className="text-3xl font-bold text-slate-900">
                  Optimal Route Calculation
                </h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Campus Compass uses Dijkstra's shortest path algorithm to calculate the most efficient routes between any two locations on campus.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="bg-blue-100 rounded-full p-1 mr-3 mt-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <span className="text-slate-700">Graph data structures with node and edge relationships</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-blue-100 rounded-full p-1 mr-3 mt-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <span className="text-slate-700">Optimized pathfinding with distance and time estimates</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-blue-100 rounded-full p-1 mr-3 mt-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <span className="text-slate-700">3D AR visualization with interactive route exploration</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-br from-slate-900 to-slate-800 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Navigate Smarter?
            </h2>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              Experience campus navigation powered by advanced algorithms and augmented reality
            </p>
            <button
              onClick={onGetStarted}
              className="px-10 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-200"
            >
              Get Started Now
            </button>
          </div>
        </section>

        <footer className="bg-slate-900 py-12 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-2 rounded-lg">
                  <Compass className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Campus Compass</span>
              </div>
              <p className="text-slate-400">
                Developed by Akshaya A, Karuna Mariyam Babu, and Gopika N K
              </p>
              <p className="text-slate-500 text-sm">
                Coimbatore Institute of Technology, Coimbatore
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
