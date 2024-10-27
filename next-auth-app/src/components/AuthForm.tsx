"use client";

import { signIn, useSession } from "next-auth/react";

export default function AuthForm() {
  const credentialsAction = (evt) => {
    evt.preventDefault();
    const formData = new FormData(evt.target);
    const data = Object.fromEntries(formData);
    console.log(data);
    signIn("credentials", { ...data, redirect: false });
  };

  const session = useSession();
  
  console.log(session)

  return (
    <main className="w-full h-[100vh] bg-indigo-950 relative overflow-hidden px-10">
      <div className="flex w-full h-full justify-center items-center">
        <div className="w-[500px] rounded-2xl bg-slate-200 py-[30px] pb-[50px] px-[15px]">
          <h1 className="text-center uppercase text-4xl font-sans">Login</h1>

          <form
            className="mt-10 flex flex-col gap-5"
            onSubmit={credentialsAction}
            method="POST"
          >
            <div className="relative border-2 border-black rounded-xl">
              <label
                htmlFor="username"
                className="absolute text-sm bg-slate-200 top-0 left-0 translate-x-[10px] translate-y-[-10px] px-1"
              >
                Enter your username
              </label>
              <input
                id="username"
                type="text"
                placeholder="Username"
                name="username"
                className="border-none outline-none bg-transparent text-2xl w-full px-3 py-3"
              />
            </div>

            <div className="relative border-2 border-black rounded-xl">
              <label
                htmlFor="password"
                className="absolute text-sm bg-slate-200 top-0 left-0 translate-x-[10px] translate-y-[-10px] px-1"
              >
                Enter your password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Password"
                name="password"
                className="border-none outline-none bg-transparent text-2xl w-full px-3 py-3"
              />
            </div>

            <input
              value={"Log in"}
              type="submit"
              className="w-full py-5 bg-slate-800 text-white rounded-2xl"
            />
          </form>
        </div>
      </div>
    </main>
  );
}
