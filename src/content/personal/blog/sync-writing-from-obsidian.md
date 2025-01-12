---
title: My Writing Setup - Syncing from Obsidian
description: I set up a way for me to write down my thoughts in Obsidian and sync to this blog. Here is a documentation of why and how I do so.
pubDate: 2025-01-12
tags:
  - obsidian
  - astro
---
I have started doing some writing more regularly. Until very recently, I wasn’t really keeping up with writing anywhere because I think I **over-engineered** my setup. 10 years ago, this very blog was just a dead simple Jekyll blog hosted on GitHub, but I don’t really enjoy writing in my IDE. The code editor doesn’t quite let me focus on writing - probably because I always wanted to tinker with the code alongside of it, which became an endless time-suck.

Then I thought - maybe I should just write in my notes app, and set up a blog that programmatically pulls the content and update regularly. After a few days of hair-pulling work exploring NextJS, which just announced SSG support at the time, and Notion, which also just announced an API, I ended up with a [blog system](https://github.com/lhr0909/notion-blog) that will fetch new articles from my Notion whenever a new user visits, and then generates a blog post from it.

Aside from a bug on image caching, this setup really helped me focus on writing, until I realized that I needed to be online (Notion still does not have offline mode as of today) and on a laptop (Notion mobile support sucked) to be able to write. As a digital nomad, I am on the go a lot. It is luxurious to take out my laptop and just do the writing, because usually I needed to work on client projects whenever I had a block of time in a cafe or co-working space. What if I could just write on my phone when I am on the plane?

Fast forward to last year, I found Obsidian. To keep it short, I am just going to list a few things I love about Obsidian:

- Offline-first with plain Markdown files. You can focus on writing however you want.
- Extensible with JavaScript plugins, and most of them work on both desktop and mobile.

With this in mind, I started working on a new blog system for me to write, and synchronize my writing on the go. Before I go over my process, I just want to quickly list the goals for this new blog system:

- I can keep all my writings in one place.
- The blog code and blog posts are separate.
- I can write on the phone.
- I can write without an Internet connection.

First step is to find a way to render Markdown files into web pages. As of 2024, Astro fits the description the best, so I put together the Astro site.

Next step is to work on the syncing of posts. Currently I mainly rely on iCloud for syncing notes between devices, but this community plugin called Remotely Save can help me synchronize the Obsidian vault into an S3 object storage bucket. Now the solution became clear - I just need to grab the blog posts from my Obsidian vault on S3 into the blog repository on GitHub.

At the beginning I was thinking to set up a custom Obsidian plugin to do so, but then I realized that I could just set up a GitHub Action from my blog to do the syncing. Here is the workflow that I put into the `.github/workflows` folder of the blog repo:

```yaml
TODO
```

When I finish writing, all I need to do is to go on GitHub (either with mobile app or on browser) and trigger this GitHub Action workflow, and it will create a pull request for syncing the blog posts. I can do a quick review before publishing (merging the changes in).

With this system set up, I can finally have the comfort of creating content anywhere. I have fully embraced the way Tim Ferris writes down notes on the phone with a keyboard, I also bring a foldable keyboard with me if I go out. Check this out:

TODO: a picture

Thank you for reading this far. I know this still feels over-engineered to some people, but it checks all the boxes for me, and more importantly, I have fun building it! I think that’s what matters.