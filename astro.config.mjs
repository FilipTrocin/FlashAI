import { defineConfig, envField } from "astro/config";

// https://astro.build/config
export default defineConfig({
    env: {
        schema: {
            SUPABASE_URL: envField.string({
                access: 'secret',
                context: 'server'
            }),
            SUPABASE_KEY: envField.string({
                access: 'secret',
                context: 'server'
            })
        }
    },
    integrations: [
        // react(),
        // tailwind()
    ]
});
