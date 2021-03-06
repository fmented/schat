export default {
    name: "Simple Chat",
    short_name: "schat",
    start_url: ".",
    display: "standalone",
    background_color: "#fff",
    description: "simple progressve semi-distributed chat app.",
    theme_color: "blueviolet",
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
    shortcuts: [
        {name: "Settings", url: '/settings', icons:[{src:'/settings.png', sizes:'192x192', type:'image/png'}]},
        {name: "Search", url:'/search', icons:[{src:'/search.png', sizes:'192x192', type:'image/png'}]}
    ]
}