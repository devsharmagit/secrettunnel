export interface PushArgs {
  content: string | null;
  filePath: string | null;
  ttl: number;
  password: string | null;
}

export interface PullArgs {
  reference: string | null;
  key: string | null;
  password: string | null;
  outputPath: string | null;
}

export interface SecretReference {
  token: string;
  key: string;
}

export interface SecretPayload {
  ciphertext: string;
  iv: string;
  passwordHash?: string;
}