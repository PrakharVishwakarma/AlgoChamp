"use client";

import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { Mail, LogOut, Shield } from "lucide-react";
import { useFlashMessageActions } from "../context/FlashMessageContext";
import { Logo } from "./Logo";

export default function UserInfo() {
  const { data: session } = useSession();
  const { showFlashMessage } = useFlashMessageActions();

  const handleSignOut = async () => {
    try {
      showFlashMessage("info", "Signing out...");
      await signOut({ redirect: true, callbackUrl: "/" });
      showFlashMessage("success", "You have been signed out successfully!");
    } catch {
      showFlashMessage("error", "Failed to sign out. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card/50 backdrop-blur-xl border border-border rounded-xl p-8 shadow-2xl max-w-md w-full">
        <div className="text-center mb-6">
          <div className="mb-6">
            <Logo size="md" className="mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">User Profile</h2>
          <div className="w-12 h-1 bg-gradient-to-r from-primary to-info rounded-full mx-auto"></div>
        </div>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <Shield className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="text-foreground font-semibold">{session?.user?.name || 'Not provided'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <Mail className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-foreground font-semibold">{session?.user?.email || 'Not provided'}</p>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-destructive/50"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}