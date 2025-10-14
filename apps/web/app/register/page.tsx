import RegisterForm from "../../components/RegisterForm";

import { ClientNavigation } from "../../components/ClientNavigation";

export default async function Register() {

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <ClientNavigation />
      <main className="flex-1">
        <RegisterForm />
      </main>
    </div>
  );
}