---
title: Render High Quality Videos of Terminal Outputs
description: Use Remotion and Asciinema to render high quality terminal outputs for coding videos.
pubDate: 2023-01-28
tags:
  - video
---

I post videos [on YouTube](https://youtube.com/@simon_liang) talking about technology (mainly AI) and showcasing my side projects online. One thing I struggle a lot is to create high quality visualizations of code and terminal outputs in the videos. When you check out videos from accounts like [Fireship](https://www.youtube.com/@Fireship) and [ByteByteGo](https://www.youtube.com/c/ByteByteGo), you will find their visuals very clear and crisp, and it takes a lot of time to record and edit using various softwares. When I started making videos myself, I definitely felt the amount of effort in production to take the videos to the next level.

I looked into [how Jeff from Fireship makes his videos](https://www.youtube.com/watch?v=N6-Q2dgodLs), he says that he makes extensive use of video editing tools like After Effect. My girlfriend has a copy of After Effect for her UI animation work, so I tried to see if I can use it to create animations of my videos. It turned out there is such a learning curve that it would take me a while to get familiar with and be productive with the tools to make videos. I don’t think I have enough time to learn all that while working on a full-time job.

I started to look for tools that can record my screen and improve the video quality. I use [Cleanshot X](https://cleanshot.com/) and [Screen Studio](https://www.screen.studio) to record my screen so I can show my code, web pages, and terminal outputs. Once the raw footage is prepared, I use [Final Cut Pro](https://www.apple.com/final-cut-pro/) (my girlfriend has a copy because she is also a YouTuber) and [CapCut](https://www.capcut.com/) (a good free alternative with a great AI to generate captions fast, built by the TikTok Team) to do the final edit and rendering before uploading to YouTube.

Even with all these tools, one problem I find is that it is still not easy to get a clear and crisp rendering of code snippets and terminal outputs. Since the fonts are small compared to the main screen, and often times we either have to zoom way in before recording, and/or have a irregular-aspect-ratio clip where I need to worry about putting an appropriate background for. What’s even harder is that, when we need to scroll around, I need to always worry about the timing. Often times it will require a few takes before the scrolling is perfect.

I start to think about my skill set and look for tools that can transfer my coding skills into video editing. I didn’t think it was possible at first, but then I discovered [Remotion](https://www.remotion.dev/), which does the following:

- It uses a React component to describe a video clip (resolution, fps etc) composition, and sets up hooks and animation methods so you can write React components to draw and animate text and images on each frame. You can essentially use this setup to render any web components and animate them. It even provides audio and video components so you can potentially render raw footages together in sync if you so desire.
- Once the composition is defined, it uses a headless Chrome browser to render the frames and finally stitches them altogether in to a high quality MP4 video.

This is a total game changer for me. First of all I don’t have to learn another tool to create video clips anymore. I can comfortably use my favorite IDE and my web frontend skills to compile animations that I need and generate clips, and more importantly, I can re-use these components very easily by setting up well-packaged compositions in a single project, so I can swap out content and re-render to generate new clips. While I admit writing code is not necessarily any faster than using industry-proven drag-and-drop tools with tons of ready-to-go templates available for download/purchase, it is something I am feeling more comfortable right now without sinking too much time into learning them. Also there is a bigger upside once I have my templates set up.

First thing I am diving into is terminal outputs. The reason I am starting with this, is that it is hard to record terminal outputs, especially those that are long running. For instance, if I want to record what it looks like to train a larger machine learning model, it will be almost impossible to do so without having an SSH session up at all times, and letting my recording software run over night. Not practical at all.

There is a terminal recording tool called `asciinema` which can be run in a shell environment to record changes in the output. It provides a web component for playback, and even offers free hosting. With [Asciinema](https://asciinema.org/), I can let it record from the remote machine and I can collect the cast files later.

With Remotion in mind, I naturally think of combining the two together so I can render high quality terminal outputs. In fact, I started this project last year and at the time `asciinema-player` didn’t provide a seek feature, so the rendering performance and timing control was non-existent. Since Remotion renders each frame based on the frame count index, so I will need to control `asciinema-player` to “navigate” to the exact point in time in the video playback, otherwise I could not control the speed of the recording from Remotion side, so the recording would end up much faster than the original. And not to mention that I had to set the rendering concurrency to 1 to avoid out-of-order outputs.

This project was canned for months until I was clearing my backlog of side projects recently and re-discovered that the seek feature is now available in `asciinema-player` v3.0.1! I quickly upgraded Remotion to V3 and set up the seeking based on frame count. And Voila, I can now control the timing on the Remotion Preview, which means that parallel rendering is also available.

<video class="!my-0" height="720" width="1080" controls>
  <source src="/remotion-demo.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>
<span class="text-xs">Working asciinema Rendering Preview in Remotion</span>

The code base is incredibly simple at the moment so I am just going to [share my repo here](https://github.com/lhr0909/asciinema-mp4) for now. And right now it is certainly crude, since a lot of the parameters are still hard-coded. But whenever I need to use it to render a clip and have extra time in my hands, I will make sure to make an update. If you find this useful in your video making workflow, please consider contributing together so we can help more people like us!

I will be creating more of these components (next up is a code rendering component) and share my learnings on it. Since I am making programming content around AI, [3b1b has an animation library for rendering math concepts](https://github.com/3b1b/manim), and I thought I should just also share it here and keep it as a note for myself when I need it.