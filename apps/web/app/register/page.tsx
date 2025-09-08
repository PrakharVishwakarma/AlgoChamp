import RegisterForm from "../../components/RegisterForm";
import { redirect } from "next/navigation";
import { authOptions } from "../lib/auth";
import { getServerSession } from "next-auth";

export default async function Register() {
  const session = await getServerSession(authOptions);

  if (session){
    redirect("/");
    return null;
  } 

  return<>
    <RegisterForm />
  </>
}