---
title: Deploy Slack Bot on Vercel using NextJS for Free
pubDate: 2022-04-12
tags:
  - chatbot
---

I have been writing Slack Bots / Slack Apps for the past two years and I have been using `@slack/bolt` NodeJS framework for my apps and bots. It is rather easy to start with since it is no different from an Express application, and it provides a lot of middlewares for reacting to slash commands, incoming messages, and interactions (button clicks, dropdown selection, etc).

I am also a huge fan of Serverless. I started writing my first lambda to download DraftKing’s NBA draft information for a side project of mine, and it has been running a few times a day restlessly for the past 7 years. At X-Tech we also help teams and enterprises embrace Serverless as much as possible.

The Slack App I have been writing is [X-late](https://x-late.x-tech.io), a translation bot that can help multi-lingual teams quickly connect and work together without any language barrier. Our team is multi-lingual and sometimes we need to connect our clients and teammate who are outside of China, to our developer and designer teammates in China, and most of the translation bots on Slack didn’t provide good enough translations to do daily collaboration. So I decided to build our own and it has been working very well for us. It was quickly put together as a NodeJS app based on `@slack/bolt` and it was deployed on my AWS account.

Lately I am in love with the [Vercel platform](https://vercel.com/home). It provides a way for me and my team to quickly put up websites written in React for free. Recently I wonder if there is a way I can move X-late into a Serverless app on Vercel. So I decided to take a crack at it.

The Slack Bolt documentation already provides a boilerplate for making the bot run on AWS Lambda. But since it is not compatible with Vercel, so I decided to see if I can hack my way around it. I came across an NPM package called `next-connect` which can set up express-like routers in a NextJS project. I then forked the `ExpressReceiver` from `@slack/bolt` and turn it into `NextConnectReceiver` which is powered by `next-connect`, and Voila! I can now set up a simple Slack Bot and deploy on Vercel for free!

I have most of my work open sourced [on my GitHub](https://github.com/lhr0909/nextjs-slack-bolt-example) so please feel free to fork and try it out. I am going to publish the `NextConnectReceiver` to a standalone NPM package soon, but for now you can just take my repository as a template and start hacking!

The only caveat I want to remind everyone when building a Slack Bot serverlessly, is the fact that the “server” is short-lived, which means that, when a request is done, the app will turn off, so any logic that is outside of the request handler will not be run. Also, Slack has a request timeout, so your bot is supposed to acknowledge and respond to the request as soon as it is received. With this in mind, you will want to make sure that your bot is not doing anything too intensive for it to be serverless-compatible.