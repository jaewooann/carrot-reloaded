"use client";

import { InitialChatRooms } from "@/app/(tabs)/chat/page";
import { formatToTimeAgo } from "@/app/libs/utils";
import { createClient, RealtimeChannel } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const SUPABASE_PUBLIC_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqYW56dHdxd3BhemVxb2RuY3dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4NTcxMzgsImV4cCI6MjA1NzQzMzEzOH0.TKAApQ8B4OKdOsRSxFhT1P1tK4O_wolLDEobH3f8wVo";
const SUPABASE_URL = "https://zjanztwqwpazeqodncwm.supabase.co";

const client = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY!);

interface IChatRoomsListProps {
  initialChatRooms: InitialChatRooms;
  user: {
    username: string;
    avatar: string | null;
  };
}

export default function ChatRoomList({
  initialChatRooms,
  user,
}: IChatRoomsListProps) {
  const [rooms, setRooms] = useState(initialChatRooms);

  const channels = useRef<RealtimeChannel[]>([]);

  useEffect(() => {
    rooms.forEach((room) => {
      console.log("channels made: ", room.id);
      const channel = client
        .channel(`room-${room.id}`)
        .on("broadcast", { event: "message" }, (payload) => {
          console.log(`Change in chatroom ${room.id}:`, payload);
          const newMessage = payload.payload;
          console.log(newMessage);

          if (newMessage) {
            // 새 매시지가 삽입된 경우 채팅방 목록 업데이트
            setRooms((prevChatRooms) =>
              prevChatRooms.map((chatRoom) =>
                chatRoom.id === room.id
                  ? {
                      ...chatRoom,
                      messages: [newMessage],
                      _count: { messages: chatRoom._count.messages + 1 },
                    }
                  : room
              )
            );
          }
        })
        .subscribe();

      channels.current.push(channel);
    });

    return () => {
      channels.current.forEach((channel) => {
        client.removeChannel(channel);
      });
    };
  }, [rooms]);
  return (
    <div className="py-12 px-4 flex flex-col h-screen justify-start items-center ">
      {rooms.map((room) => (
        <Link
          key={room.id}
          href={`/chats/${room.id}`}
          className="cursor-pointer w-full"
        >
          <div className="px-3 py-2 w-full flex justify-center items-center rounded-xl">
            <div className="flex justify-between w-full py-4 px-4 rounded-xl bg-base-100 shadow-xl">
              <div className="flex justify-center items-center gap-4">
                {room.users[0]?.avatar ? (
                  <Image
                    src={`${room.users[0].avatar}`}
                    alt={room.users[0].username}
                    width={40}
                    height={40}
                  />
                ) : (
                  <div className="size-8 rounded-full bg-slate-400"></div>
                )}
                <div className=" flex flex-col gap-1">
                  <div className="text-xl text-white">
                    {room.users[0].username}
                  </div>
                  <div className="text-teal-500 text-sm">
                    {room.messages[0]?.payload ?? null}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 ">
                <span className="text-white">
                  {formatToTimeAgo(room.messages[0]?.created_at.toString())}
                </span>
                {room?._count?.messages === 0 ? null : (
                  <div className="badge rounded-md p-1 bg-orange-400 text-white">{`+${room._count.messages}`}</div>
                )}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
