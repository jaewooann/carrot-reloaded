"use client";

import { useFormStatus } from "react-dom";

export default function CommentButton() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="bg-orange-400">
      {pending ? "로딩 중" : "등록"}
    </button>
  );
}
