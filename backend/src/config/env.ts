import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from backend/.env
dotenv.config();

/**
 * Zod Schema for strict Environment Variable Validation
 * Enforces correct data types and required fields at startup.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z
    .coerce
    .number()
    .int()
    .min(1)
    .max(65535)
    .default(5000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required for Prisma DB access'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters long'),
  SESSION_SECRET: z.string().min(16, 'SESSION_SECRET must be at least 16 characters long'),
  GEMINI_API_KEY: z.string().optional().default(''),
});

// Parse and validate process.env
const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ FATAL: Environment Variable Validation Error:');
    console.error(JSON.stringify(result.error.format(), null, 2));
    throw new Error('Invalid environment variables. Backend server shutting down.');
  }

  return result.data;
};

export const env = parseEnv();
export type Env = z.infer<typeof envSchema>;
