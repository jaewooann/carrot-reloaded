import { notFound, redirect } from "next/navigation";
import db from "@/app/libs/db";
import getSession from "@/app/libs/session";
// import { Suspense } from "react";

async function getUser() {
  const session = await getSession();
  if (session.id) {
    const user = await db.user.findUnique({
      where: {
        id: session.id,
      },
    });
    if (user) {
      return user;
    }
  }
  notFound();
}

// async function Username() {
//   await new Promise((resolve) => setTimeout(resolve, 3000));
//   const user = await getUser();
//   return <h1>Welcome! {user?.username}!</h1>;
// }

export default async function Profile() {
  const user = await getUser();
  const logOut = async () => {
    "use server";
    const session = await getSession();
    await session.destroy();
    redirect("/");
  };

  return (
    <div>
      <h1>Welcome! {user?.username}!</h1>
      {/* <Suspense fallback={"Hello!"}>
        <Username />
      </Suspense> */}
      <form action={logOut}>
        <button>Log out</button>
      </form>
    </div>
  );
}
