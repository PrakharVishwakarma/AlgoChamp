import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
export default async function Admin() {
    const session = await getServerSession(authOptions);
    console.log('Admin session:', session);

    return <div>
        <h2>Admin Dashboard</h2>
        <p>Welcome, {session?.user.role} {session?.user.name}</p>        
    </div>;
} 