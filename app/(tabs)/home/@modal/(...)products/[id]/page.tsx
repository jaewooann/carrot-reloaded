import db from "@/app/libs/db";
import XButton from "@/components/x-button";
import Image from "next/image";
import { notFound } from "next/navigation";

export default async function Modal({ params }: { params: { id: string } }) {
  const id = +params.id;
  if (isNaN(id)) {
    return notFound();
  }

  const product = await db.product.findUnique({
    where: {
      id,
    },
    select: {
      photo: true,
      title: true,
    },
  });

  if (!product) {
    return notFound();
  }
  return (
    <div className="absolute w-full h-full z-50 flex justify-center items-center bg-black left-0 top-0 bg-opacity-60">
      <XButton />
      <div className="max-w-screen-sm w-full h-1/2 flex justify-center">
        <div className="relative flex items-center justify-center overflow-hidden rounded-md aspect-square bg-neutral-700 text-neutral-200">
          <Image
            src={`${product.photo}`}
            alt={product.title}
            fill
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
