import z from 'zod';

const envSchema = z.object({
	ECOM_HOST: z.string().url(),
	ECOM_PATH: z.string(),
});

export const processEnv = envSchema.parse(process.env);

type EnvSchemaType = z.infer<typeof envSchema>;

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace NodeJS {
		interface ProcessEnv extends EnvSchemaType {}
	}
}
