import adapter from "@sveltejs/adapter-vercel";
import path from "path";
import preprocess from "svelte-preprocess";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: preprocess(),

  kit: {
    adapter: adapter(),
    
    methodOverride: {
      allowed: ['POST']
    },
    vite: {
      define:{
        'process.env': process.env
      },
      resolve: {
        alias: {
          auth: path.resolve("src/lib/auth"),
          model: path.resolve("src/lib/model"),
          idb: path.resolve("src/lib/idb"),
          utils: path.resolve("src/lib/utils"),
          interfaces: path.resolve("src/lib/interfaces"),
          components: path.resolve("src/lib/components"),
        },
      },
      optimizeDeps: {
        include: ['brcypt', 'uuid']
      }

    },
  },
};

export default config;
