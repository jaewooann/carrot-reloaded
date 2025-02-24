export interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: "public" | "private";
}

export interface GitHubProfile {
  id: number;
  login: string;
  avatar_url: string;
}
