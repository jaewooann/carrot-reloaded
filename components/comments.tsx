import { EllipsisVerticalIcon } from "@heroicons/react/24/solid";
import {
  HandThumbUpIcon as OutlineHandThumbUpIcon,
  HandThumbDownIcon as OutlineHandThumbDownIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";

interface CommentsProps {
  id: number;
  payload: string;
  userId: number;
  user: {
    avatar: string | null;
    username: string;
  };
  sessionId: number;
  createdAt: string;
}

export default function Comments({
  id,
  payload,
  userId,
  user,
  sessionId,
  createdAt,
}: CommentsProps) {
  return (
    <div
      key={id}
      className="w-4/5 mx-auto mt-2 py-4 border-neutral-600 border-b-2 last:border-b-0 "
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 ">
          {user.avatar ? (
            <Image
              src={`${user.avatar}/avatar`}
              alt={user.username}
              width={30}
              height={30}
            />
          ) : (
            <div className="rounded-full size-8 bg-slate-400"></div>
          )}
          <div>{user.username}</div>
          <div className="text-xs text-neutral-500">{createdAt}</div>
        </div>
        <div>
          {userId === sessionId ? (
            <EllipsisVerticalIcon className="size-5" />
          ) : null}
        </div>
      </div>
      <div className="flex items-center justify-between pl-4 mt-4">
        <div className="text-base text-neutral-100">{payload}</div>
        <div className="flex items-center gap-3 *:size-5 *:cursor-pointer">
          <OutlineHandThumbUpIcon />
          <OutlineHandThumbDownIcon />
        </div>
      </div>
    </div>
  );
}
