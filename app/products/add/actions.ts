"use server";

import { z } from "zod";
import fs from "fs/promises";
import db from "@/app/libs/db";
import getSession from "@/app/libs/session";
import { redirect } from "next/navigation";

const productSchema = z.object({
  photo: z.string({
    required_error: "사진은 필수입니다.",
  }),
  title: z.string({
    required_error: "제목은 필수입니다.",
  }),
  description: z.string({
    required_error: "설명은 필수입니다.",
  }),
  price: z.coerce.number({
    required_error: "가격은 필수입니다.",
  }),
});

export async function uploadProduct(_: any, formdata: FormData) {
  const data = {
    photo: formdata.get("photo"),
    title: formdata.get("title"),
    price: formdata.get("price"),
    description: formdata.get("description"),
  };
  if (data.photo instanceof File) {
    const photoData = await data.photo.arrayBuffer();
    await fs.appendFile(`./public/${data.photo.name}`, Buffer.from(photoData));
    data.photo = `/${data.photo.name}`;
  }
  const result = productSchema.safeParse(data);
  if (!result.success) {
    return result.error.flatten();
  } else {
    const session = await getSession();
    if (session.id) {
      const product = await db.product.create({
        data: {
          title: result.data.title,
          description: result.data.description,
          price: result.data.price,
          photo: result.data.photo,
          user: {
            connect: {
              id: session.id,
            },
          },
        },
        select: {
          id: true,
        },
      });
      redirect(`/products/${product.id}`);
    }
  }
}
