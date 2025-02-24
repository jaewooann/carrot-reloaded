import { GitHubEmail, GitHubProfile } from "@/app/types/github";

const GITHUB_API_BASE = "https://api.github.com";

export class GitHubAPIError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "GitHubAPIError";
  }
}

export async function fetchGitHubAPI<T>(
  endpoint: string,
  accessToken: string
): Promise<T> {
  const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
    cache: "no-cache",
  });

  if (!response.ok) {
    throw new GitHubAPIError(
      `github API 요청 실패: ${response.statusText}`,
      response.status
    );
  }

  return response.json();
}

export async function getUserProfile(
  accessToken: string
): Promise<GitHubProfile> {
  return fetchGitHubAPI<GitHubProfile>("/user", accessToken);
}

export async function getPublicEmail(
  accessToken: string
): Promise<string | null> {
  try {
    const emails = await fetchGitHubAPI<GitHubEmail[]>(
      `/user/emails`,
      accessToken
    );

    // 먼저 공개이면서 대표  메일을 찾음
    const primaryPublicEmail = emails.find(
      (email) => email.visibility === "public" && email.primary
    );
    if (primaryPublicEmail) return primaryPublicEmail.email;

    // 없다면 그냥 공개 이메일 중 첫 번째 반환
    const firstPublicEmail = emails.find(
      (email) => email.visibility === "public"
    );
    return firstPublicEmail?.email ?? null;
  } catch (error) {
    console.error("GitHub 이메일 조회 실패:", error);
    return null;
  }
}

export async function getGitHubAccessToken(code: string): Promise<string> {
  const accessTokenParams = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    client_secret: process.env.GITHUB_CLIENT_SECRET!,
    code,
  }).toString();

  const accessTokenUrl = `https://github.com/login/oauth/access_token?${accessTokenParams}`;
  const accessTokenResponse = await fetch(accessTokenUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  });

  const { error, access_token } = await accessTokenResponse.json();

  if (error) {
    throw new GitHubAPIError("GitHub 액세스 토큰 발급 실패", 400);
  }

  return access_token;
}
