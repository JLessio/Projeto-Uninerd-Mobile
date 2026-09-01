import dotenv from 'dotenv';

dotenv.config();
const legacySecurityEnv: Record<string, string> = {};
dotenv.config({ path: 'backend/.env', processEnv: legacySecurityEnv, quiet: true });

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim() || legacySecurityEnv.JWT_SECRET?.trim();
  if (secret) return secret;
  if (process.env.NODE_ENV === 'test') return 'uninerd_test_secret';
  throw new Error('JWT_SECRET deve ser configurado no arquivo .env.');
}
