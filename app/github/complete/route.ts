import db from "@/app/libs/db";
import loginUser from "@/app/libs/login";
import {
  getGitHubAccessToken,
  getPublicEmail,
  getUserProfile,
} from "@/app/libs/utils/github";
import { NextRequest, NextResponse } from "next/server";

async function generateUniqueUsername(baseUsername: string) {
  let username = baseUsername;
  let counter = 1;

  while (true) {
    // 현재 username으로 검색
    const existingUser = await db.user.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
      },
    });

    // 사용 가능한 username이면 반환
    if (!existingUser) {
      return username;
    }

    // 사용중이면 숫자 붙여 다시 시도.
    username = `${baseUsername}-${counter}`;
    counter++;
  }
}

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code");
    if (!code) {
      return new Response(null, {
        status: 400,
      });
    }

    const access_token = await getGitHubAccessToken(code);

    const [profile, email] = await Promise.all([
      getUserProfile(access_token),
      getPublicEmail(access_token),
    ]);

    // 기존 사용자 확인
    const existingUser = await db.user.findUnique({
      where: {
        github_id: String(profile.id),
      },
      select: {
        id: true,
      },
    });

    // 기존 사용자 있으면 로그인 처리
    if (existingUser) {
      await loginUser(existingUser.id);
      return NextResponse.redirect(new URL("/profile", request.url));
    }

    // 기존 사용자 없다면 새 사용자 생성
    // 1. 고유 username 생성
    const uniqueUsername = await generateUniqueUsername(profile.login);

    // 2. 새 사용자 생성
    const newUser = await db.user.create({
      data: {
        username: uniqueUsername,
        github_id: String(profile.id),
        avatar: profile.avatar_url,
        email,
      },
      select: {
        id: true,
      },
    });
    await loginUser(newUser.id);
    return NextResponse.redirect(new URL("/profile", request.url));
  } catch (error) {
    console.error("gitHub 로그인 실패", error);
    return new Response(null, {
      status: 400,
    });
  }
}
