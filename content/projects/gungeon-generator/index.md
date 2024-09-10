---
title: Gungeon Generator
summary: A procedural dungeon generator modelled after Enter the Gungeon 🎲
tags: ["projects", "python", "networkx", "matplotlib"]
---


The dungeons in Enter the Gungeon are procedurally generated but still contain structure to minimize the effects of RNG. This project was my attempt to reconstruct the dungeon generation algorithm and extend it. A wealth of knowledge was gleaned from [this article](https://www.boristhebrave.com/2019/07/28/dungeon-generation-in-enter-the-gungeon/).

I decided to use Python as it's a very easy language to wield. I used networkx to handle the graph manipulation such as joining together subgraphs and adding new vertices.

Since the output was going to be on an ASCII grid, I handled the rotation of the rooms and corridors with numpy matrices. With regular python lists I suspect this would have been much more slow. I never managed to finish the rendering part of the code though. However, I was able to get some nice renderings of dungeon layouts from the graph visualisation functions provided by networkx.
