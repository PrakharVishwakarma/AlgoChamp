import UserInfo from "../../components/UserInfo";
import { authOptions } from "../lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
    return null;
  }

  return (
    <>
      <UserInfo />
    </>
  );
}
