---
layout: post.njk
title: "Building an Accessible, Expanding Search Input Field"
date: 2024-03-21
tags: ["post", "code", "javascript", "css"]
description: "A modern implementation of an expanding search input field that grows as you type, perfect for search forms and message inputs."
---

# Building an Accessible, Expanding Search Input Field

<small>Tags: search, search input, google search input, prototype, component, accessible, expanding, css, javascript</small>

I recently worked with our design team to prototype an interesting solution: how to create a search box that works well for both simple and complex searches. You know, like when you're quickly looking up "weather" versus searching for "best Italian restaurants open late on Sunday in Manchester city centre".

> Just want to see it in action? [Skip to the demo](/demos/expanding-search/)

## The Problem

Most search boxes are a bit rubbish, really. They're either:
- Too big, taking up loads of space when you just want to type "weather"
- Too small, making it hard to see what you're typing when searching for something specific
- Fixed width, forcing you to scroll back and forth to check long queries

After watching how people actually use search, we noticed something interesting: about 80% of searches are short and sweet (1-3 words), but the remaining 20% can be quite detailed and specific. We needed something that would work brilliantly for both.

## The Solution

Working with the designers, we prototyped a search input concept that:
- Starts small and tidy - perfect for those quick searches
- Automatically grows as you type longer queries
- Keeps everything visible on one line until you need more space
- Expands and contracts depending on the length of the query
- Works with screen readers and keyboard navigation
- Maintains the correct contrast ratios for accessibility

What makes it special is how it adapts. When you start typing, it feels natural and unobtrusive. But as your query grows, the search box grows with you, making sure you can always see what you're typing without any faff.

## The Technical Bits

Here's where it gets interesting. Instead of using a standard `<input type="text">`, we used a `<textarea>` element with some clever CSS to make it behave like a single-line input that can grow:

```html
<div class="expanding-search" role="search">
    <textarea 
        class="expanding-search__input" 
        rows="1"
        aria-label="Search"
    ></textarea>
</div>
```

The clever bit happens with a combination of CSS properties:
- `resize: none` stops users from manually resizing the textarea
- `overflow-y: hidden` hides the scrollbar until we need it
- `min-height` ensures it starts at single-line height
- `line-height` and `padding` are carefully set to prevent jumping

We also use a hidden "measure" element to calculate the perfect height:
```html
<div class="expanding-search__measure" aria-hidden="true"></div>
```

This invisible div mirrors the textarea's content, letting us measure how tall the content should be without any visual glitches. When combined with smooth transitions, it creates that satisfying expanding effect you see in the demo.

## The Prototype

Using vanilla JavaScript (no frameworks needed), I knocked together an interactive prototype to test the concept. The prototype helped us:
- Validate the interaction design with real users
- Test keyboard navigation and screen reader compatibility
- Fine-tune the expansion behaviour
- Ensure it worked well across different devices and screen sizes

I've put together a [simple demo](/demos/expanding-search/) that shows how the concept works. Have a play with it and see how it:
- Starts at a comfortable size for short queries
- Smoothly expands as you type longer searches
- Adapts nicely to different screen sizes
- Handles keyboard navigation and screen readers

The demo shows the core concept - you can adjust things like rows, maximum width, and other aspects to suit your specific needs. I'll be adding more examples showing different ways to implement this pattern soon.

Stay tuned for more updates. In the meantime, you can follow me on [LinkedIn](https://www.linkedin.com/in/sensecall/) for the latest. 