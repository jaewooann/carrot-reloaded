import db from "@/app/libs/db";
import ProductList from "@/components/product-list";
import { PlusIcon } from "@heroicons/react/24/solid";
import { Prisma } from "@prisma/client";
import { unstable_cache as nextCache, revalidatePath } from "next/cache";
import Link from "next/link";
import React from "react";

const getCahsedProducts = nextCache(getInitialProducts, ["home-products"]);

async function getInitialProducts() {
  console.log("hit!!!");
  const products = await db.product.findMany({
    select: {
      title: true,
      price: true,
      created_at: true,
      photo: true,
      id: true,
    },
    // take: 1,
    orderBy: {
      created_at: "desc",
    },
  });
  return products;
}

export type InitialProducts = Prisma.PromiseReturnType<
  typeof getInitialProducts
>;

const revalidate = async () => {
  "use server";
  revalidatePath("/home");
};

export const metadata = {
  title: "Home",
};

const Products = async () => {
  const initialProducts = await getCahsedProducts();
  return (
    <div>
      <ProductList initialProcuts={initialProducts} />
      <form action={revalidate}>
        <button>Revalidate</button>
      </form>
      <Link
        href="/products/add"
        className="bg-orange-500 flex items-center justify-center rounded-full size-16 fixed bottom-24 right-8 text-white transition-colors hover:bg-orange-400"
      >
        <PlusIcon className="size-10" />
      </Link>
    </div>
  );
};

export default Products;
