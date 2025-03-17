import db from "@/app/libs/db";
import getSession from "@/app/libs/session";
import ChatMessagesList from "@/components/chat-messages-list";
import { Prisma } from "@prisma/client";
import { notFound } from "next/navigation";
import { maskMessageAsRead } from "./actions";

async function getRoom(id: string) {
  const room = await db.chatRoom.findUnique({
    where: {
      id,
    },
    include: {
      users: {
        select: {
          id: true,
        },
      },
    },
  });
  console.log(room);

  if (room) {
    const session = await getSession();
    const canSee = Boolean(room.users.find((user) => user.id === session.id!));

    if (!canSee) {
      return null;
    }
  }

  return room;
}

async function getMessages(chatRoomId: string) {
  const messages = await db.message.findMany({
    where: {
      chatRoomId,
    },
    select: {
      id: true,
      payload: true,
      created_at: true,
      userId: true,
      isRead: true,
      user: {
        select: {
          avatar: true,
          username: true,
        },
      },
    },
  });
  return messages;
}

async function getUserProfile() {
  const session = await getSession();
  const user = await db.user.findUnique({
    where: {
      id: session.id!,
    },
    select: {
      username: true,
      avatar: true,
    },
  });
  return user;
}

export type InitialChatMessages = Prisma.PromiseReturnType<typeof getMessages>;

export default async function ChatRoom({ params }: { params: { id: string } }) {
  const room = await getRoom(params.id);
  if (!room) {
    return notFound();
  }
  const initialMessages = await getMessages(params.id);

  // 초기값으로 들어가는거 채팅방 읽으면서 읽음으로 바꿔주기
  const setReadMessages = initialMessages.map((message) => ({
    ...message,
    isRead: true,
  }));
  // db에 실제로 isRead:true 작업해주기
  await maskMessageAsRead(params.id);

  const session = await getSession();
  const user = await getUserProfile();
  if (!user) {
    return notFound();
  }
  return (
    <ChatMessagesList
      chatRoomId={params.id}
      userId={session.id!}
      username={user.username}
      avatar={user.avatar!}
      initialMessages={setReadMessages}
    />
  );
}
