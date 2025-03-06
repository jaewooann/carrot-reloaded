"use client";

import Button from "@/components/button";
import Input from "@/components/input";
import { PhotoIcon } from "@heroicons/react/24/solid";
import React, { useState } from "react";
import { uploadProduct } from "./actions";
import { useFormState } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, ProductType } from "./schema";

export default function AddProduct() {
  const [preview, setPreview] = useState("");
  const [state, dispatch] = useFormState(uploadProduct, null);

  const { register, handleSubmit } = useForm<ProductType>({
    resolver: zodResolver(productSchema),
  });

  const onImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { files },
    } = event;
    if (!files) return;
    const file = files[0];

    if (!file.type.startsWith("image/")) {
      return {
        error: "이미지 파일만 업로드 가능합니다.",
      };
    }

    const fileSizeInMb = file.size / (1024 * 1024);

    if (fileSizeInMb > 2) {
      return {
        error: "이미지의 크기가 2MB를 초과하는 이미지는 업로드 할 수 없습니다.",
      };
    }

    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  return (
    <div>
      <form action={dispatch} className="p-5 flex flex-col gap-5">
        <label
          htmlFor="photo"
          style={{
            backgroundImage: `url(${preview})`,
          }}
          className="border-2 bg-center bg-cover aspect-square flex items-center justify-center flex-col text-neutral-300 border-neutral-300 rounded-md cursor-pointer border-dashed"
        >
          {preview === "" ? (
            <>
              <PhotoIcon className="w-20" />
              <div className="text-neural-400 text-sm">
                사진을 추가해주세요.
                {state?.fieldErrors.photo}
              </div>
            </>
          ) : null}
        </label>
        <input
          onChange={onImageChange}
          type="file"
          id="photo"
          name="photo"
          className="hidden"
        />
        <Input
          required
          placeholder="제목"
          type="text"
          {...register("title")}
          errors={state?.fieldErrors.title}
        />
        <Input
          required
          placeholder="가격"
          type="number"
          {...register("price")}
          errors={state?.fieldErrors.price}
        />
        <Input
          required
          placeholder="자세한 설명"
          type="text"
          {...register("description")}
          errors={state?.fieldErrors.description}
        />
        <Button text="작성완료" />
      </form>
    </div>
  );
}
