import { redirect } from "next/navigation";

import { checkAuth } from "@/lib/auth";
import LoginForm from "@/components/LoginForm";

export default async function LoginPage() {
  // Already in? Don't make them type it again.
  const auth = await checkAuth();
  if (auth.ok) redirect("/");
  return <LoginForm />;
}
