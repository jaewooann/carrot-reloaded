"use server";

import db from "@/app/libs/db";
import getSession from "@/app/libs/session";
import { revalidateTag } from "next/cache";
import { z } from "zod";

const commentSchema = z.object({
  payload: z.string({
    required_error: "페이로드는 필수값입니다.",
  }),
  postId: z.string({
    required_error: "포스트 아이디는 필수값입니다.",
  }),
});

export async function likePost(postId: number) {
  // await new Promise((resolve) => setTimeout(resolve, 5000));
  const session = await getSession();
  try {
    await db.like.create({
      data: {
        postId,
        userId: session.id!,
      },
    });
    revalidateTag(`like-status-${postId}`);
  } catch (error) {
    console.error("에러입니다.", error);
  }
}

export async function dislikePost(postId: number) {
  // await new Promise((resolve) => setTimeout(resolve, 5000));
  const session = await getSession();
  try {
    await db.like.delete({
      where: {
        id: {
          postId,
          userId: session.id!,
        },
      },
    });
    revalidateTag(`like-status-${postId}`);
  } catch (error) {
    console.error("에러입니다.", error);
  }
}

export async function uploadComment(_: any, formData: FormData) {
  const data = {
    payload: formData.get("comment"),
    postId: formData.get("postId"),
  };
  const result = commentSchema.safeParse(data);
  if (!result.success) {
    return result.error.flatten();
  } else {
    try {
      const session = await getSession();
      const { id, created_at, payload, postId, updated_at, userId } =
        await db.comment.create({
          data: {
            payload: result.data.payload,
            post: {
              connect: {
                id: Number(result.data.postId),
              },
            },
            user: {
              connect: {
                id: session.id,
              },
            },
          },
        });

      revalidateTag("post-detail");
      return { id, created_at, payload, postId, updated_at, userId };
    } catch (error) {}
  }
}
