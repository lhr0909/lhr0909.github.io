---
title: How I use Obsidian Bases for task management
description: After Obsidian Bases come out, I start to move my vault towards using bases. Here is how I use Obsidian Bases to manage tasks.
pubDate: 2025-09-08
tags:
  - obsidian
  - buildinpublic
---
I have been following Obsidian Bases since it came out on Catalyst, but I didn't fully switch until it became stable a few weeks ago. Before last weekend, I started to do some small migrations to bases in my vault. I have most of my notes in folders and organized by tags instead of backlinks, so the migration for me was easier. In just a few minutes, I am already moving from dataview to bases.

Then the big question comes to my tasks - I have a lot of them already filled out, and managed by the Tasks plugin, but one thing I do desperately need is to manage tasks that are too big to fit in one line. I was using a note to describe what my project does, and tasks would be listed below for me to track progress. To me, I want to be able to group these projects, and see overall progress, so I can decide which project to work on next.

Then I found in a forum post saying that there is currently no way to track tasks as a base column, and unlikely in the foreseeable future, because of the way Bases work. As a developer, I want to see if I can solve my own problem with a little bit of code.

Since Obsidian Bases operate on note properties (frontmatter in the markdown files), so naturally I was thinking to surface the information in the note to the properties. I was thinking to completely ditch the Tasks plugin and set up something for myself, but then I realized that

- I already have a lot of tasks written into different notes, I don't want to migrate all of that. The Tasks plugin has been very useful and I want to keep it as much as I can.
- There is a significant learning curve to building a plugin, and I want to be able to have something useful as quickly as possible.

Then suddenly something clicked for me - I could check for the tasks in the note, and just maintain a counter in the properties! After a few minutes digging around other existing plugins, and I found just what I needed, and I was able to build out [a plugin](https://github.com/lhr0909/obsidian-plugin-task-properties) that works.

<video controls>
  <source src="https://divby0.io/obsidian-task-properties-demo.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

Currently the plugin will monitor the entire vault and the open file for any updates (specifically metadata updates in the Obsidian plugin terms), which includes the file's tasks. And it will update how many tasks are marked as completed and how many tasks are in total in the note, and add them to a `progress` property. Then in the base, you can set up a formula column to calculate the actual progress as a percentage and display  / sort the notes however you wish. This will only work on the notes with a `#task` tag in the `tags` property.

Since I whip this up together in just a few minutes, I choose to use these default fields and do not provide an option to update, but if this is useful for anyone that are in the similar situation, you can try it out by downloading it via BRAT and let me know how it works! I am going to refine and add settings so it can be customized and submit as a community plugin.