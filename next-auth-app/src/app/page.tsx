import { auth } from "@/auth";
import AuthForm from "@/components/AuthForm";

export default async function Home() {
  const session = await auth();

  console.log(session)

  return (
    <>
      <AuthForm />
    </>
  );
}
