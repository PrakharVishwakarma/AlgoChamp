// /apps/web/scripts/test-routes.js

/**
 * Route Protection Test Script
 * 
 * This script can be run in the browser console to automatically test
 * route protection behaviors.
 */

const routes = [
  { path: '/', type: 'public', name: 'Landing Page' },
  { path: '/register', type: 'public', name: 'Registration' },
  { path: '/dashboard', type: 'protected', name: 'Dashboard' },
  { path: '/problems', type: 'protected', name: 'Problems' },
  { path: '/contests', type: 'protected', name: 'Contests' },
  { path: '/about', type: 'mixed', name: 'About' },
];

console.log('🛡️ AlgoChamp Route Protection Test');
console.log('================================');

routes.forEach(route => {
  console.log(`📍 ${route.name} (${route.path}) - ${route.type.toUpperCase()}`);
  console.log(`   To test: window.location.href = '${window.location.origin}${route.path}'`);
});

console.log('\n🔍 Testing Instructions:');
console.log('1. Copy and paste the commands above to test each route');
console.log('2. Check if redirects happen as expected');
console.log('3. Monitor Network tab for 301/302 status codes');
console.log('4. Check middleware logs in console');

// Helper function to test a route
window.testRoute = function(path) {
  console.log(`🧪 Testing route: ${path}`);
  const startTime = Date.now();
  
  fetch(path, { 
    method: 'GET',
    credentials: 'include',
    redirect: 'manual' // Don't follow redirects automatically
  })
  .then(response => {
    const endTime = Date.now();
    console.log(`📊 Route: ${path}`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Type: ${response.type}`);
    console.log(`   Redirected: ${response.redirected}`);
    console.log(`   Time: ${endTime - startTime}ms`);
    
    if (response.status >= 300 && response.status < 400) {
      console.log(`   ↩️  Redirect to: ${response.headers.get('location') || 'Unknown'}`);
    }
  })
  .catch(error => {
    console.error(`❌ Error testing ${path}:`, error);
  });
};

console.log('\n🚀 Quick test function added: testRoute(path)');
console.log('Example: testRoute("/problems")');