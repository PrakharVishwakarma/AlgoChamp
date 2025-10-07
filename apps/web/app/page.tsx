// /apps/web/app/page.tsx

import { ClientNavigation } from "../components/ClientNavigation";
import { JSX } from "react";

export default function Page(): JSX.Element {
  return (
    <div>
      <ClientNavigation />
      
      {/* Main Content - Server Rendered */}
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-white mb-6">
              Welcome to <span className="text-blue-400">AlgoChamp</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Master competitive programming with our comprehensive platform. 
              Practice problems, participate in contests, and elevate your coding skills.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                <h3 className="text-2xl font-semibold text-white mb-4">🎯 Practice Problems</h3>
                <p className="text-gray-300">
                  Solve curated programming challenges from beginner to advanced levels.
                </p>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                <h3 className="text-2xl font-semibold text-white mb-4">🏆 Contests</h3>
                <p className="text-gray-300">
                  Participate in timed contests and compete with programmers worldwide.
                </p>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                <h3 className="text-2xl font-semibold text-white mb-4">📊 Analytics</h3>
                <p className="text-gray-300">
                  Track your progress with detailed performance analytics and insights.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}