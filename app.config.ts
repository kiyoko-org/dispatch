import 'dotenv/config';

// Keep it JS-typed to avoid type import issues in Expo
export default ({ config }: { config: any }) => ({
  ...config,
  extra: {
    ...config.extra,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  },
});
