import getSession from "./session";

export default async function loginUser(userId: number) {
  const session = await getSession();
  session.id = userId;
  await session.save();
}
