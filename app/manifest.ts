import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "IESTP",
    short_name: "IESTP",
    description:
      "Sistema de Control del IESTP Andrés Avelino Cáceres Dorregaray",
    start_url: "/",
    display: "standalone",
    background_color: "#1B2B6B",
    theme_color: "#1B2B6B",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
