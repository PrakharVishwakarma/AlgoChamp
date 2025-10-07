import RegisterForm from "../../components/RegisterForm";
import { redirect } from "next/navigation";
import { authOptions } from "../lib/auth";
import { getServerSession } from "next-auth";
import { ClientNavigation } from "../../components/ClientNavigation";

export default async function Register() {
  const session = await getServerSession(authOptions);

  if (session){
    redirect("/dashboard");
    return null;
  } 

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <ClientNavigation />
      <main className="flex-1">
        <RegisterForm />
      </main>
    </div>
  );
}