import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Profile() {
  const session = await auth();

  console.log(session)

  if (!session?.user) {
    redirect("/");
  }

  return <>
    <p className="text-white bg-black">{session?.user.name}</p>
  </>;
}
