/* eslint-disable @typescript-eslint/no-unused-vars */
import db from "@/app/libs/db";
import { formatToWon } from "@/app/libs/utils";
import { UserIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { unstable_cache as nextCache } from "next/cache";
import getSession from "@/app/libs/session";

async function getIsOwner(userId: number) {
  // const session = await getSession();
  // if (session.id) {
  //   return session.id === userId;
  // }
  return false;
}

async function getProduct(id: number) {
  const product = await db.product.findUnique({
    where: {
      id,
    },
    include: {
      user: {
        select: {
          username: true,
          avatar: true,
        },
      },
    },
  });
  return product;
}

const getCachedProduct = nextCache(getProduct, ["product-detail"], {
  tags: ["product-detail"],
});

async function getProductTitle(id: number) {
  const product = await db.product.findUnique({
    where: {
      id,
    },
    select: {
      title: true,
    },
  });
  return product;
}

const getCachedProductTitle = nextCache(getProductTitle, ["product-title"], {
  tags: ["product-title"],
});

export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = await getCachedProductTitle(Number(params.id));
  return {
    title: product?.title,
  };
}

export default async function ProductDetail({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return notFound();
  }

  const product = await getCachedProduct(id);
  if (!product) {
    return notFound();
  }
  const isOwner = await getIsOwner(product.userId);
  const onDelete = async () => {
    "use server";
    await db.product.delete({
      where: {
        id,
      },
    });
    redirect("/home");
  };

  const createChatRoom = async () => {
    "use server";

    const session = await getSession();
    const room = await db.chatRoom.create({
      data: {
        users: {
          connect: [
            {
              id: product.userId,
            },
            {
              id: session.id,
            },
          ],
        },
      },
      select: {
        id: true,
      },
    });
    redirect(`/chats/${room.id}`);
  };
  return (
    <div>
      <div className="relative aspect-square">
        <Image
          fill
          src={product.photo}
          alt={product.title}
          className="object-cover"
        />
      </div>
      <div className="p-5 flex items-center gap-3 border-b border-neutral-700">
        <div className="size-10 rounded-full overflow-hidden">
          {product.user.avatar !== null ? (
            <Image
              width={40}
              height={40}
              src={product.user.avatar}
              alt={product.user.username}
            />
          ) : (
            <UserIcon />
          )}
        </div>
        <div>
          <h3>{product.user.username}</h3>
        </div>
      </div>
      <div className="p-5">
        <h1 className="text-2xl font-semibold">{product.title}</h1>
        <p>{product.description}</p>
      </div>
      <div className="fixed w-full bottom-0 left-0 p-5 pb-10 bg-neutral-800 flex justify-between items-center">
        <span className="font-semibold text-xl">
          {formatToWon(product.price)}원
        </span>
        <div className="flex items-center gap-2">
          {isOwner ? (
            <form action={onDelete}>
              <button className="bg-red-500 px-5 py-2.5 rounded-md text-white font-semibold">
                삭제하기
              </button>
            </form>
          ) : null}
          <form action={createChatRoom}>
            <button className="bg-orange-500 px-5 py-2.5 rounded-md text-white font-semibold">
              채팅하기
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// export const dynamicParams = false;

export async function generateStaticParams() {
  const products = await db.product.findMany({
    select: {
      id: true,
    },
  });
  return products.map((product) => ({ id: product.id + "" }));
}
