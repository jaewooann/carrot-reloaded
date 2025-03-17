"use server";

import db from "@/app/libs/db";
import getSession from "@/app/libs/session";

export async function saveMessage(payload: string, chatRoomId: string) {
  const session = await getSession();
  await db.message.create({
    data: {
      payload,
      chatRoomId,
      userId: session.id!,
    },
    select: {
      id: true,
    },
  });
}

export async function maskMessageAsRead(chatRoomId: string) {
  const updateMessage = await db.message.updateMany({
    where: {
      chatRoomId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });

  return updateMessage;
}
