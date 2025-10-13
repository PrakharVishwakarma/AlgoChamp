// /apps/web/app/test-routes/page.tsx

import { JSX } from "react";
import { Shield, Lock, Globe, AlertTriangle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { ClientNavigation } from "../../components/ClientNavigation";
import { Logo } from "../../components/Logo";

interface RouteTest {
  name: string;
  path: string;
  type: "public" | "protected" | "admin" | "mixed";
  description: string;
  expectedBehavior: string;
}

const routeTests: RouteTest[] = [
  {
    name: "Landing Page",
    path: "/",
    type: "mixed",
    description: "Main landing page - should redirect authenticated users to dashboard",
    expectedBehavior: "Unauthenticated: ✅ Allow | Authenticated: ↩️ Redirect to /dashboard"
  },
  {
    name: "Registration",
    path: "/register", 
    type: "public",
    description: "User registration page - only for unauthenticated users",
    expectedBehavior: "Unauthenticated: ✅ Allow | Authenticated: ↩️ Redirect to /dashboard"
  },
  {
    name: "Dashboard",
    path: "/dashboard",
    type: "protected", 
    description: "User dashboard - requires authentication",
    expectedBehavior: "Unauthenticated: ↩️ Redirect to signin | Authenticated: ✅ Allow"
  },
  {
    name: "Problems",
    path: "/problems",
    type: "protected",
    description: "Problems listing - requires authentication", 
    expectedBehavior: "Unauthenticated: ↩️ Redirect to signin | Authenticated: ✅ Allow"
  },
  {
    name: "Contests",
    path: "/contests",
    type: "protected",
    description: "Contests listing - requires authentication",
    expectedBehavior: "Unauthenticated: ↩️ Redirect to signin | Authenticated: ✅ Allow"
  },
  {
    name: "About",
    path: "/about",
    type: "mixed",
    description: "About page - accessible to everyone",
    expectedBehavior: "Unauthenticated: ✅ Allow | Authenticated: ✅ Allow"
  }
];

export default function TestRoutesPage(): JSX.Element {
  return (
    <div className="min-h-screen bg-background">
      <ClientNavigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-6">
            <Logo size="lg" className="mx-auto" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Route Protection Test Suite</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Test the route protection system by visiting different pages. 
            This page shows expected behaviors for authentication and authorization.
          </p>
        </div>

        {/* Middleware Status */}
        <div className="bg-info/10 border border-info/20 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-info" />
            <h2 className="text-xl font-semibold text-info">Middleware Status: Active</h2>
          </div>
          <p className="text-info/80 mb-4">
            The Next.js middleware is running and protecting routes based on authentication status.
            Check the browser console for middleware logs during navigation.
          </p>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-success/10 border border-success/20 rounded p-3">
              <div className="flex items-center gap-2 text-success font-medium mb-1">
                <CheckCircle className="w-4 h-4" />
                Route Protection
              </div>
              <p className="text-success/80">Active</p>
            </div>
            <div className="bg-success/10 border border-success/20 rounded p-3">
              <div className="flex items-center gap-2 text-success font-medium mb-1">
                <CheckCircle className="w-4 h-4" />
                Rate Limiting
              </div>
              <p className="text-success/80">Enabled</p>
            </div>
            <div className="bg-success/10 border border-success/20 rounded p-3">
              <div className="flex items-center gap-2 text-success font-medium mb-1">
                <CheckCircle className="w-4 h-4" />
                Security Logging
              </div>
              <p className="text-success/80">Monitoring</p>
            </div>
          </div>
        </div>

        {/* Route Categories */}
        <div className="grid lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <Globe className="w-6 h-6 text-blue-500" />
              <h3 className="font-semibold text-foreground">Public Only</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Accessible only to unauthenticated users
            </p>
            <p className="text-xs text-blue-500">Redirects authenticated users</p>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <Lock className="w-6 h-6 text-orange-500" />
              <h3 className="font-semibold text-foreground">Protected</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Requires user authentication
            </p>
            <p className="text-xs text-orange-500">Redirects to sign in</p>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-6 h-6 text-red-500" />
              <h3 className="font-semibold text-foreground">Admin Only</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Requires admin privileges
            </p>
            <p className="text-xs text-red-500">Restricted access</p>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <Globe className="w-6 h-6 text-green-500" />
              <h3 className="font-semibold text-foreground">Mixed</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Accessible to everyone
            </p>
            <p className="text-xs text-green-500">No restrictions</p>
          </div>
        </div>

        {/* Route Tests */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground mb-6">Route Test Cases</h2>
          
          {routeTests.map((route, index) => (
            <div key={index} className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {route.type === "public" && <Globe className="w-5 h-5 text-blue-500" />}
                  {route.type === "protected" && <Lock className="w-5 h-5 text-orange-500" />}
                  {route.type === "admin" && <Shield className="w-5 h-5 text-red-500" />}
                  {route.type === "mixed" && <Globe className="w-5 h-5 text-green-500" />}
                  
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{route.name}</h3>
                    <p className="text-sm text-muted-foreground">{route.description}</p>
                  </div>
                </div>
                
                <Link
                  href={route.path}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded font-medium hover:bg-primary/90 transition-colors"
                >
                  Test Route
                </Link>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <span className="text-sm font-medium text-foreground">Expected Behavior:</span>
                </div>
                <p className="text-sm text-muted-foreground font-mono">
                  {route.expectedBehavior}
                </p>
              </div>
              
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="px-2 py-1 bg-secondary rounded">
                  Path: {route.path}
                </span>
                <span className={`px-2 py-1 rounded ${
                  route.type === "public" ? "bg-blue-100 text-blue-700" :
                  route.type === "protected" ? "bg-orange-100 text-orange-700" :
                  route.type === "admin" ? "bg-red-100 text-red-700" :
                  "bg-green-100 text-green-700"
                }`}>
                  {route.type.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Testing Instructions */}
        <div className="mt-12 bg-accent/50 border border-border rounded-lg p-8">
          <h2 className="text-xl font-bold text-foreground mb-4">How to Test</h2>
          <div className="space-y-3 text-muted-foreground">
            <p><strong>1. Unauthenticated Testing:</strong> Open an incognito/private browser window and visit the routes above.</p>
            <p><strong>2. Authenticated Testing:</strong> Sign in to your account and test the same routes.</p>
            <p><strong>3. Console Monitoring:</strong> Open browser DevTools (F12) → Console to see middleware logs.</p>
            <p><strong>4. Network Monitoring:</strong> Check the Network tab to see redirect responses (301/302 status codes).</p>
          </div>
        </div>
      </main>
    </div>
  );
}