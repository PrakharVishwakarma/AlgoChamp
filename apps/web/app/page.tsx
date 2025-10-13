// /apps/web/app/page.tsx

import { ClientNavigation } from "../components/ClientNavigation";
import { LandingPage } from "../components/landing/LandingPage";
import { JSX } from "react";

export default function Page(): JSX.Element {
  return (
    <div className="min-h-screen bg-background">
      <ClientNavigation />
      <LandingPage />
    </div>
  );
}