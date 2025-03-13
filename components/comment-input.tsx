"use client";

import { useFormState } from "react-dom";
import CommentButton from "./comment-button";
import { uploadComment } from "@/app/posts/[id]/actions";
import { Suspense, useOptimistic, useState } from "react";
import Comments from "./comments";
import { formatToTimeAgo } from "@/app/libs/utils";

interface User {
  username: string;
  avatar: string | null;
}

interface CommentProps {
  id: number;
  payload: string;
  userId: number;
  created_at: Date;
  user: User;
}

interface CommentInputProps {
  postId: number;
  sessionId: number;
  comments: CommentProps[];
  user: User;
}

export default function CommentInput({
  postId,
  sessionId,
  comments,
  user,
}: CommentInputProps) {
  const [commentText, setCommentText] = useState("");
  const [optimisticState, reducerFn] = useOptimistic(
    comments,
    (previousComment, payload: CommentProps) => [...previousComment, payload]
  );

  // 서버 액션을 인터셉트해서 필요한 작업 수행
  // formData 이용해서 newComment 생성
  const interceptAction = async (_: any, formData: FormData) => {
    // formData 이용해서 newComment 생성
    const newComment = {
      payload: formData.get("comment")?.toString()!,
      id: postId,
      created_at: new Date(),
      userId: sessionId,
      user: {
        username: "optimistic",
        avatar: null,
      },
    };

    reducerFn(newComment);
    formData.append("postId", postId + "");

    setCommentText("");

    return uploadComment(_, formData);
  };
  console.log(optimisticState);

  // useFormState
  const [_, dispatch] = useFormState(interceptAction, null);

  return (
    <div>
      <Suspense fallback={<div>loading...</div>}>
        {optimisticState.map((comment) => (
          <Comments
            key={comment.id}
            id={comment.id}
            payload={comment.payload}
            sessionId={sessionId}
            user={comment.user}
            userId={comment.userId}
            createdAt={formatToTimeAgo(comment.created_at.toString())}
          />
        ))}
      </Suspense>
      <div className="w-4/5 mx-auto mt-6 mb-10">
        <form action={dispatch} className="grid grid-cols-5 gap-2 w-full ">
          <input
            className="col-span-4 text-black"
            type="text"
            name="comment"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="댓글을 입력해 주세요."
          />
          <CommentButton />
        </form>
      </div>
    </div>
  );
}
