import type {RequestHandler} from '@sveltejs/kit'
export const get:RequestHandler = async function () {
    return {
        status:200,
        body: {
            name: "simplechat",
            short_name: "schat",
            start_url: ".",
            display: "standalone",
            background_color: "#fff",
            description: "simple distributed chat app.",
            theme_color: "#fff",
            icons: [
                {
                    src: "/android-chrome-192x192.png",
                    sizes: "192x192",
                    type: "image/png"
                },
                {
                    src: "/android-chrome-512x512.png",
                    sizes: "512x512",
                    type: "image/png"
                }
            ],
        }
    }
    
}