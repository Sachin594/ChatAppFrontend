import { getServerSession } from "next-auth";
import Login from "./Login";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

const page = async () => {
  const session = await getServerSession(authOptions);
  if (session && session?.user?.role) {
    switch (session.user.role) {
      case "ADMIN":
        redirect("/admin/dashboard");
      case "USER":
        redirect("/");
      default:
        break;
    }
  } else {
    return <Login />;
  }
};

export default page;
