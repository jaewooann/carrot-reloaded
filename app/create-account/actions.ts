/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { z } from "zod";

const checkUsername = (username: string) => !username.includes("potato");

const checkPasswords = ({
  password,
  confirmPassword,
}: {
  password: string;
  confirmPassword: string;
}) => password === confirmPassword;

const formSchema = z
  .object({
    username: z
      .string({
        invalid_type_error: "username은 string이어야 합니다.",
        required_error: "username은 필수로 입력하셔야 합니다.",
      })
      .min(3, "Way too short!!")
      .max(10, "that is too long!")
      .refine(checkUsername, "감자는 입력할 수 없어!"),
    email: z.string().email(),
    password: z.string().min(10),
    confirmPassword: z.string().min(10),
  })
  .refine(checkPasswords, {
    message: "비밀번호와 확인은 같아야합니다.",
    path: ["confirmPassword"],
  });

export async function createAccount(prevState: any, formData: FormData) {
  const data = {
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };
  const result = formSchema.safeParse(data);
  if (!result.success) {
    console.log(result.error.flatten());
    return result.error.flatten();
  }
}
