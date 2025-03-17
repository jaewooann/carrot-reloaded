"use server";

import db from "@/app/libs/db";
import getSession from "@/app/libs/session";
import { notFound } from "next/navigation";

export async function getChatRooms(userId: number) {
  const chatRooms = await db.chatRoom.findMany({
    where: {
      users: {
        some: {
          id: userId,
        },
      },
    },
    select: {
      id: true,
      messages: {
        take: 1,
        orderBy: {
          created_at: "desc",
        },
      },
      _count: {
        select: {
          messages: {
            where: {
              isRead: false,
              userId: {
                not: userId,
              },
            },
          },
        },
      },
      users: {
        where: {
          id: {
            not: userId,
          },
        },
        select: {
          avatar: true,
          username: true,
        },
      },
      product: {
        select: {
          photo: true,
        },
      },
    },
  });

  chatRooms.sort((a, b) => {
    const messageA = a.messages[0]?.created_at || new Date(0);
    const messageB = b.messages[0]?.created_at || new Date(0);
    return messageB.getTime() - messageA.getTime(); // 내림차순 정렬 (최신순)
  });

  return chatRooms;
}

export async function getUser() {
  const session = await getSession();
  if (session.id) {
    const user = await db.user.findUnique({
      where: {
        id: session.id,
      },
      select: {
        avatar: true,
        username: true,
      },
    });
    if (user) return user;
  }
  notFound();
}
