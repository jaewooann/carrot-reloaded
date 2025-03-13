"use client";

import { InitialChatMessages } from "@/app/chats/[id]/page";
import { formatToTimeAgo } from "@/app/libs/utils";
import { ArrowUpCircleIcon } from "@heroicons/react/24/solid";
import { createClient, RealtimeChannel } from "@supabase/supabase-js";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const SUPABASE_PUBLIC_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqYW56dHdxd3BhemVxb2RuY3dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4NTcxMzgsImV4cCI6MjA1NzQzMzEzOH0.TKAApQ8B4OKdOsRSxFhT1P1tK4O_wolLDEobH3f8wVo";
const SUPABASE_URL = "https://zjanztwqwpazeqodncwm.supabase.co";

interface ChatMessagesListProps {
  userId: number;
  initialMessages: InitialChatMessages;
  chatRoomId: string;
}

export default function ChatMessagesList({
  userId,
  initialMessages,
  chatRoomId,
}: ChatMessagesListProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [message, setMessage] = useState("");
  const channel = useRef<RealtimeChannel>();

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { value },
    } = event;
    setMessage(value);
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setMessages((prevMsgs) => [
      ...prevMsgs,
      {
        id: Date.now(),
        payload: message,
        created_at: new Date(),
        userId,
        user: {
          username: "string",
          avatar: "xxx",
        },
      },
    ]);
    channel.current?.send({
      type: "broadcast",
      event: "message",
      payload: { message },
    });
    setMessage("");
  };

  useEffect(() => {
    const client = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
    channel.current = client.channel(`room-${chatRoomId}`);
    channel.current
      .on("broadcast", { event: "message" }, (payload) => {
        console.log(payload);
      })
      .subscribe();

    return () => {
      channel.current?.unsubscribe();
    };
  }, []);

  return (
    <div className="p-5 flex flex-col gap-5 min-h-screen justify-end ">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-2 items-start ${
            message.userId === userId ? "justify-end" : ""
          }`}
        >
          {/* {message.user.avatar ? (
            <Image
              src={message.user.avatar}
              alt={message.user.username}
              width={50}
              height={50}
              className="size-8 rounded-full"
            />
          ) : (
            <div className="size-8 rounded-full bg-gray-300 flex items-center justify-center">
              {message.user.username.charAt(0).toUpperCase()}
            </div>
          )} */}
          <div
            className={`flex flex-col gap-1 ${
              message.userId === userId ? "items-end" : ""
            }`}
          >
            <span
              className={`${
                message.userId === userId ? "bg-neutral-500" : "bg-orange-500"
              } p-2.5 rounded-md`}
            >
              {message.payload}
            </span>
            <span className="text-sm">
              {formatToTimeAgo(message.created_at.toString())}
            </span>
          </div>
        </div>
      ))}
      <form className="flex relative" onSubmit={onSubmit}>
        <input
          value={message}
          onChange={onChange}
          required
          className="bg-transparent rounded-full w-full h-10 focus:outline-none px-5 ring-2 focus:ring-4 transition ring-neutral-200 focus:ring-neutral-50 border-none placeholder:text-neutral-400"
          type="text"
          name="message"
          placeholder="Write a message..."
        />
        <button className="absolute right-0">
          <ArrowUpCircleIcon className="size-10 text-orange-500 transition-colors hover:text-orange-300" />
        </button>
      </form>
    </div>
  );
}
