---
title: Using i18next in Astro
description: How I set up i18next in Astro v5 for localization.
pubDate: 2024-12-30
tags:
  - webdev
  - astro
---

I recently started using [Astro](https://astro.build) for my indie hacking projects, and I wanted to add internationalization (i18n) support to one of my sites.

The built-in i18n features was not enough for me because I am setting up pSEO pages, and I wanted to have a single template for all languages. Also the project I was working on used i18next, so I wanted to re-use the translation files and structure. There was `astro-i18next` package but it was not updated for Astro v5. I really needed something quick and dirty.

Originally I was using the new content layer of Astro and load the translation files from `public/locales` directory. I wrote a quick `t` function myself and went from there, but then I realized that I needed more than just a simple translation function. I needed features such as locale fallbacks, interpolation etc. that come with i18next.

Being new to Astro, it took me a bit to realize that I could just load the files using the filesystem backend at buildtime. So the plan was to create an i18next instance at buildtime, and then use it on the pages.

Here is the instance initialization code:

```typescript
// @site/utils/i18next.ts

import { createInstance } from 'i18next';
import Backend from 'i18next-fs-backend';

// shares the same config with native astro i18n
import { defaultLocale, locales } from '@site/locales.config';

// this is a build-time i18next instance
export async function getFixedT(locale: string) {
  const newInstance = createInstance();

  return newInstance.use(Backend).init({
    lng: locale,
    fallbackLng: defaultLocale,
    supportedLngs: locales,
    ns: ['translation'],
    defaultNS: 'translation',
    backend: {
      loadPath: './public/locales/{{lng}}/{{ns}}.json',
    },
  });
}
```

Once this is done, I can use this instance in my pages like this (using my footer for example):

```astro
---
// @site/components/Footer.astro

import { getFixedT } from "@site/utils/i18next";

interface Props {
  locale?: string;
}

const { locale = "en" } = Astro.props;
const t = await getFixedT(locale);
---

<footer class="w-full">
  <div class="mx-12 p-4 flex justify-between border-t">
    <div class="flex gap-4">
      <a href="/terms">{t("terms")}</a>
      <a href="/privacy">{t("privacy")}</a>
    </div>
    <div>©{new Date().getFullYear()} My Company</div>
  </div>
</footer>
```

And voila! I have i18next working in my Astro project. This works well because I rely on prerendering 100% with Astro (my app path still uses React), and I don't need to worry about loading the translation files at runtime. I can also use the same translation files for my React app, which is a huge plus.

The only caveat I ran into is that [it conflicts with Starlight](https://github.com/withastro/starlight/issues/2742). The workaround is to locally patch the type definition in starlight to remove the `defaultNS` field. Sharing my patch below.

```
diff --git a/i18n.d.ts b/i18n.d.ts
index 8cb82217cd7b2ffbab5262c44452a87ac724f452..2c7825fa257491c3951800043fef4384bb7ef891 100644
--- a/i18n.d.ts
+++ b/i18n.d.ts
@@ -10,8 +10,8 @@ import 'i18next';

 declare module 'i18next' {
 	interface CustomTypeOptions {
-		defaultNS: typeof import('./utils/createTranslationSystem').I18nextNamespace;
 		resources: {
+			translation: Record<string, string>;
 			starlight: Record<import('./utils/createTranslationSystem').I18nKeys, string>;
 		};
 	}
```

I hope this helps you if you are looking to add i18next to your Astro project.
