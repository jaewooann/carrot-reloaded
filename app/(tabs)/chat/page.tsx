import ChatRoomList from "@/components/chat-room-list";
import { Prisma } from "@prisma/client";
import React from "react";
import { getChatRooms, getUser } from "./actions";
import getSession from "@/app/libs/session";
// import { unstable_cache as nextCache } from "next/cache";
import { notFound } from "next/navigation";

export type InitialChatRooms = Prisma.PromiseReturnType<typeof getChatRooms>;

const Chat = async () => {
  const session = await getSession();
  // const getCachedChatRooms = nextCache(getChatRooms, ["chatroom-list"], {
  //   tags: ["chatroom-list"],
  // });
  const initialChatRooms = await getChatRooms(session.id!);

  const user = await getUser();
  if (!user) {
    return notFound();
  }
  return <ChatRoomList initialChatRooms={initialChatRooms} user={user} />;
};

export default Chat;
