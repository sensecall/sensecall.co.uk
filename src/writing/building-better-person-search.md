---
title: Building better person search interfaces
description: A deep dive into creating flexible, user-friendly person search interfaces that work across different systems and handle real-world complexity.
date: 2025-03-22
tags: ['UX', 'Design Patterns', 'Accessibility', 'JavaScript']
status: draft
layout: post
---

# Building better person search interfaces

*This is a work in progress but I thought it's worth sharing as it's something I've been working on recently.*

## The challenge

Searching for people seems simple at first glance. Just add a couple of text fields for names and you're done, right?

<!-- example of a simple single field person search interface -->
<div class="bg-white dark:bg-stone-900 shadow-md p-8 rounded-lg">
    <label class="text-lg font-medium mb-2" for="person-search-example-1">Search for a person</label>
    <input type="text" id="person-search-example-1" class="w-full p-2 border border-stone-300 dark:border-stone-600 rounded-md" placeholder="Enter a name" value="David Smith">
</div>

But real-world person search is complex. People's names can be recorded differently across systems. Dates of birth might be entered in various formats. And users often have incomplete or uncertain information when searching.

## Common problems with person search

Through my work on government services, I've seen many issues with person search:

- Names entered in different orders (e.g. "David Smith" vs "Smith, David")
- Multiple given names used inconsistently
- People who go by their middle name rather than first name
- Hyphenated surnames split across fields
- Dates of birth recorded in different formats
- Uncertainty about exact dates ("I think it was sometime in June 1980")
- Records using initials instead of full names
- Historical name changes not captured

Often, these issues lead to failed searches and duplicate records, which can be frustrating for users and costly for services.

Here are some examples of how names might be recorded differently:

| Format | Example |
|--------|---------|
| Full names | Forename Middle Surname |
| Two names | Forename Surname |
| Reversed | Surname, Forename |
| With middle | Surname, Forename Middle |
| Initials | F M Surname |
| Mixed | F Surname |
| Reversed initials | Surname, F M |
| *And so on...* | *... you get the idea* |

## A better approach

I've been thinking a lot about how to improve person search interfaces. After a lot of research and experimentation, I've come up with a pattern that allows users to enter names in a flexible way, and generates all the variations we need to find matches.

The key principles are:

1. **Accept uncertainty**: Let users enter what they know, even if it's incomplete
2. **Generate variations**: Create different combinations of the input to match how data might be stored
3. **Let users to enter multiple names and variations**: Allow users to enter multiple names and variations, and we'll generate all the variations we need to find matches

## How it works

The interface has three main parts:

1. **Multiple name inputs**
   - Separate fields for first names, middle names, and surnames
   - Add multiple entries for each type
   - Remove entries you don't need
   - Clear labelling and purpose

2. **Flexible date handling**
   - Standard date inputs with validation
   - Add multiple possible dates
   - Specify how precise each date is
   - Support for date ranges

3. **Search variations**
   - Shows all the ways we'll search using their input
   - Includes different name orders
   - Handles initials and full names
   - Supports multiple date formats

## Name variation handling

How it might look in practice:

<div class="bg-white dark:bg-stone-900 shadow-md p-8 rounded-lg flex flex-row gap-4">
    <div class="flex-1">
        <label class="text-lg font-medium mb-2" for="person-search-example-2-first-name">First name</label>
        <input type="text" id="person-search-example-2-first-name" class="w-full p-2 border border-stone-300 dark:border-stone-600 rounded-md" placeholder="Enter a name" value="David">
    </div>
    <div class="flex-1">
        <label class="text-lg font-medium mb-2" for="person-search-example-2-last-name">Last name</label>
        <input type="text" id="person-search-example-2-last-name" class="w-full p-2 border border-stone-300 dark:border-stone-600 rounded-md" placeholder="Enter a name" value="Smith">
    </div>
</div>

The pattern generates several types of name variations:

```
David James Smith
Smith, David James
James David Smith
Smith, James David
D J Smith
Smith, D J
J D Smith
Smith, J D
```

This helps match records where:
- Names are stored in different orders
- Only initials are recorded
- Middle names are used as primary names
- Comma-separated formats are used

## Date handling

Dates are equally flexible:

- Accept partial dates (month and year only)
- Generate different format variations (UK, US, ISO)
- Support approximate matching ("within 2 years")
- Handle multiple possible dates

## Use cases

This pattern is particularly useful for:

### Healthcare
- Finding patient records across different systems
- Emergency department patient lookup
- Historical medical record searching
- Clinical trial matching

### Government services
- Benefit applications
- Public records searching
- Immigration status checking
- Criminal record checks

### Financial services
- Customer verification
- Anti-money laundering checks
- Account matching
- Credit history searching

### Research
- Genealogy searches
- Academic research
- Population studies
- Historical records

## Accessibility considerations

The pattern is built with accessibility in mind:

- Clear, descriptive labels
- Proper ARIA attributes
- Keyboard navigation support
- Screen reader friendly
- Error prevention
- Clear feedback
- Progressive enhancement

## Future improvements

Areas I'm still working on:

- Phonetic name matching
- Cultural name format support
- Non-Latin character handling
- Machine learning enhancements
- Performance optimisation
- More date format support
- Better duplicate detection
- Confidence scoring

## Try it yourself

You can try a [demo of this pattern](/demos/person-search) to see how it handles different scenarios. The code is available on GitHub (coming soon).

## Feedback welcome

I'd love to hear your thoughts on this pattern. How could it be improved? What other scenarios should it handle? Let me know on [LinkedIn](https://www.linkedin.com/in/sensecall/) or [Bluesky](https://bsky.app/profile/sensecall.co.uk).

## Further reading

- [GOV.UK Design System - Names](https://design-system.service.gov.uk/patterns/names/)
- [W3C Personal Names Around the World](https://www.w3.org/International/questions/qa-personal-names)
- [Falsehoods Programmers Believe About Names](https://www.kalzumeus.com/2010/06/17/falsehoods-programmers-believe-about-names/) 