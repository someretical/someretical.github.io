---
title: Godot Tile Platformer
summary: A tiling platformer engine made with Godot 🎮
tags: ["projects", "godot", "game"]
---

This project is my attempt at making a tile based platformer with the Godot engine. I actually used [Griffpatch's playlist](https://www.youtube.com/playlist?list=PLy4zsTUHwGJIc90UaTKd-wpIH12FCSoLh) which teaches you how to make it in Scratch but I wrote the project in C++ as that is my preferred language.

Godot has its own native GDScript language but that is a scripted language and I wanted to go with a more performant language like C++ which happened to have native bindings which worked out pretty well.

I had wanted to do a project like this for a long time. Although it is possible to create very complicated projects in Scratch, they have a bunch of annoying restrictions imposed on them as the performance of the Scratch engine is pretty terrible overall. The syntax is also incredibly clunky for doing array accesses and not all behaviour is well documented; you have to experiment to see how it behaves in edge cases. This is why I decided to recreate the premise of the project but in another game engine.

Of course, the downside of using another game engine is that you need to translate everything and in some cases, Scratch actually takes care of a lot of implementation details where Godot makes you do it yourself. However, I was much more satisfied with the performance Godot offered. Like other game engines, it splits the rendering and the physics processing into separate threads so even if your physics engine is choking, you might still be rendering at a comfortable 60fps.

The one thing I wasn't completely satisfied with Godot was its final build sizes. For a pretty simple overall game, the final build sizes were around 50MB+. I tried optimizing it and got down to about 40MB but I feel like there is still a lot of dead weight in those builds.
