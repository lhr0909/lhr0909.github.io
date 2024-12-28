import type { APIRoute } from "astro";
import { satoriAstroOG } from "satori-astro";
import { getCollection } from "astro:content";

import { OgTemplate } from "@/components/OgTemplate";

export const GET: APIRoute = async ({ props }) => {
  const fontFile = await fetch(
    "https://og-playground.vercel.app/inter-latin-ext-700-normal.woff"
    // "https://www.divby0.io/InterVariable.woff"
  );
  const fontData: ArrayBuffer = await fontFile.arrayBuffer();

  return await satoriAstroOG({
    template: OgTemplate({ title: props.data.title }),
    width: 1200,
    height: 600,
  }).toResponse({
    satori: {
      fonts: [
        {
          name: "Inter Latin",
          data: fontData,
          style: "normal",
        },
      ],
    },
  });
};

export async function getStaticPaths() {
  const posts = await getCollection("blog");
  return posts.map((post) => ({
    params: { slug: post.id },
    props: post,
  }));
}