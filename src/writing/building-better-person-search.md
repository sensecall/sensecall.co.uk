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
How do we search a complex dataset to find a person?

Seems fairly simple at first glance. Just give the user a search field, send the query to the backend, and get the results back.

<!-- example of a simple single field person search interface -->
<div class="bg-white dark:bg-stone-900 shadow-md p-8 rounded-lg">
    <div class="space-y-2">
        <label class="text-lg font-medium block" for="person-search-example-1">Search for a person</label>
        <div class="flex gap-4">
            <input type="text" id="person-search-example-1" class="flex-1 p-2 border border-stone-300 dark:border-stone-600 rounded-md" placeholder="Enter a name" value="David Smith 1980-07-30">
            <button class="bg-blue-600 dark:bg-blue-400 text-white px-4 py-2 rounded-md">Search</button>
        </div>
    </div>

   <div class="mt-6">
        <h2 class="text-lg font-medium mb-2">Results</h2>
        <div class="text-stone-600 dark:text-stone-400">
            Found 20,000 documents matching "David Smith 1980-07-30".
        </div>
    </div>
</div>

Or, another example:

<!-- example of a simple single field person search interface -->
<div class="bg-white dark:bg-stone-900 shadow-md p-8 rounded-lg">
    <div class="space-y-2">
        <label class="text-lg font-medium block" for="person-search-example-2">Search for a person</label>
        <div class="flex gap-4">
            <input type="text" id="person-search-example-2" class="flex-1 p-2 border border-stone-300 dark:border-stone-600 rounded-md" placeholder="Enter a name" value="Yaroslav D Petrovic 1980-07-30">
            <button class="bg-blue-600 dark:bg-blue-400 text-white px-4 py-2 rounded-md">Search</button>
        </div>
    </div>
    <div class="mt-6">
        <h2 class="text-lg font-medium mb-2">Results</h2>
        <div class="text-stone-600 dark:text-stone-400">
            Found 300 documents matching "Yaroslav D Petrovic 1980-07-30".
        </div>
    </div>
</div>

## Except it's not that simple
On the face of it, the two examples look ok – we did a search for a person and got some results back. 

But, in reality, we'd almost certainly find that the results returned don't actually contain the person we were looking for.

### Why not?
#### Data quality
Data quality in large, complex datasets is often poor:
- Names get recorded in different ways (e.g. "Yaroslav Petrovic" vs "Yaroslav Dmytro Petrovic")
- Dates of birth might be entered in various formats (e.g. "1980-07-30" vs "30 July 1980")
- Data may be recorded in different fields, or embedded within long-form free-text fields.

#### Name variations
Very often, subjects may choose to go by a nickname or alias, or they may have a middle name that they prefer to be called by. For example, "Yaroslav D Petrovic" might be known to their friends as "Dima", and their official records may list their full name as "Yaroslav Dmytro Petrovic".

International families may also have different name orders, or use initials instead of a full name. There's a great article on [W3C Personal Names Around the World](https://www.w3.org/International/questions/qa-personal-names) that covers some of these variations.


## How do users deal with these problems?
We've observed that experienced users will most often use search operators to construct complex search queries in an attempt to improve the quality of the results returned. Here's a table of common examples:

| Search goal | Example query |
|------------|---------------|
| Find documents relating to a person named David Smith | `(David OR Dave) AND (Smith OR Smyth)` |
| Find documents relating to a person named David Smith who was born on 30th July 1980 | `(David OR Dave) AND (Smith OR Smyth) AND (1980-07-30 OR 30 July 1980)` |
| Find documents relating to a person named David Smith who was born in 1980 and has a middle name of James | `(David OR Dave) AND (Smith OR Smyth) AND (1980-01-01 OR 1980 OR 1980s) AND (James OR Jim)` |

These queries are often constructed by trial and error, with the user trying different variations of the query until they get a satisfactory number of results (either too many or too few).

Often, these queries can become very complex, very quickly, especially when the user is searching for a person who has a common name.

### Another problem we observed
Users often need to search with incomplete or uncertain information.

Some real-world examples:

Example 1
> I'm looking for a person named "Roger Michael Mitchell" born sometime in June 1950.

Example 2
> I'm trying to find all the records for a person who's surname is "Atkinson" and who was born on 21st January 1945.

Example 3
> I'm looking for a person named "Ann Rose Smith" who was born sometime in the 1970s.

---

## So what can we do to improve searching for people?
The main problems we've identified with searching for people in a dataset are:

- Names get recorded in different ways
- Dates of birth might be entered in various formats
- Data may be recorded in different fields, or embedded within long-form free-text fields
- Users may need to search with incomplete or uncertain information

If we allow users to enter the information they know in a structured format, we can transform it into useful variations for searching:

<div class="bg-white dark:bg-stone-900 shadow-md p-8 rounded-lg">
<div class="grid grid-cols-3 gap-4 mb-6">
<div>
<label class="block text-sm font-medium mb-2">First name</label>
<input type="text" class="w-full p-2 border-2 border-stone-200 rounded" value="David">
</div>
<div>
<label class="block text-sm font-medium mb-2">Middle name</label>
<input type="text" class="w-full p-2 border-2 border-stone-200 rounded" value="James">
</div>
<div>
<label class="block text-sm font-medium mb-2">Last name</label>
<input type="text" class="w-full p-2 border-2 border-stone-200 rounded" value="Smith">
</div>
</div>
<pre class="font-mono text-sm p-4 rounded border-2 border-stone-200">
David James Smith      # full names
Smith, David James    # full names, reversed
D J Smith            # initials
Smith, D J          # initials, reversed
James David Smith   # middle name first
Smith, James David # middle name first, reversed
D Smith            # first initial only
Smith, D          # first initial only, reversed</pre>
</div>

This structured approach allows us to:
- Generate variations systematically
- Handle different name orders
- Create initial-based formats
- Support comma-separated variations


## We can also take a similar approach to dates

<div class="bg-white dark:bg-stone-900 shadow-md p-8 rounded-lg">
<div class="grid grid-cols-3 gap-4 mb-6">
<div>
<label class="block text-sm font-medium mb-2">Day</label>
<input type="text" class="w-full p-2 border-2 border-stone-200 rounded" value="30">
</div>
<div>
<label class="block text-sm font-medium mb-2">Month</label>
<input type="text" class="w-full p-2 border-2 border-stone-200 rounded" value="7">
</div>
<div>
<label class="block text-sm font-medium mb-2">Year</label>
<input type="text" class="w-full p-2 border-2 border-stone-200 rounded" value="1980">
</div>
</div>
<pre class="font-mono text-sm p-4 rounded border-2 border-stone-200">
30 July 1980
30/07/1980
1980-07-30
30th July 1980
July 30th, 1980
... and so on.
</pre>
</div>




## How it works

The interface has three main parts:

1. **Multiple name inputs**
   - Separate fields for first names, middle names, and surnames
   - Allow users to add multiple entries for each type
   - ... and remove entries they don't need

2. **Flexible date handling**
   - Standard date inputs (à la [GOV.UK Design System](https://design-system.service.gov.uk/components/date-input/))
   - Allow users to add multiple possible dates
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