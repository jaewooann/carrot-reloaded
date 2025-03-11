/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import fs from "fs/promises";
import db from "@/app/libs/db";
import getSession from "@/app/libs/session";
import { redirect } from "next/navigation";
import { productSchema } from "./schema";

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
