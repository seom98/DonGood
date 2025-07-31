import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/*"], // 모든 하위 경로 차단
        },
        sitemap: "https://www.don-good.xyz/sitemap.xml",
    };
}