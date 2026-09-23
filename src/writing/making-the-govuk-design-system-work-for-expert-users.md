---
title: Making the GOV.UK Design System work for expert users
description: The GOV.UK Design System is still a strong starting point for internal services. Repeated use is where you sometimes need to stretch the patterns.
date: 2026-09-18
tags: ["Service Design", "GOV.UK Design System", "Expert Users", "UX"]
layout: post
---

I've spent a lot of my career designing government services for people who use them as part of their job.

Police officers, caseworkers, analysts, civil servants and operational staff. Sometimes they're spread across dozens of organisations, with thousands or even tens of thousands of people ultimately using the same service.

For this kind of work, I still think the [GOV.UK Design System](https://design-system.service.gov.uk/) is one of the best places you can start.

You get accessible, well-tested components, sensible conventions and clear content and interaction patterns. You also get a common design language that teams can understand and build consistently. More importantly, a lot of the thinking behind it encourages teams to remove unnecessary complexity rather than simply recreating whatever came before.

That's just as useful for an internal operational service as it is for somebody renewing a passport.

The differences start to become more obvious when the person using your service is going to come back tomorrow, and the day after that, and perhaps use it hundreds of times over the next year.

## Designing for repeated use

A lot of public-facing government services are designed for infrequent use.

Somebody might complete the journey once a year, once every few years, or once in their life. They need to be able to arrive with very little prior knowledge and understand what to do, so breaking a journey down into small, clear steps often works very well.

An experienced caseworker has a different relationship with their service.

They might work through 50 records in a day. An analyst might construct and run searches repeatedly, compare results, refine them, save useful ones and return to previous work. An operational user might know the sequence of information they need to enter almost by muscle memory.

Over time, every unnecessary click, page load and repeated piece of data entry starts to matter.

This is where I've found you sometimes need to stretch the standard GOV.UK patterns a little.

The Service Manual gives you room to do that. Its [guidance on forms](https://www.gov.uk/service-manual/design/form-structure) says to start with one thing per page, while also recognising that internal government users may need to repeat and switch between tasks quickly, and that research may lead you to combine things.

I think the important part is treating the pattern as a starting point rather than something that has to be applied unchanged whatever you learn from users.

I've worked on services where five closely related inputs spread across five pages would have made little sense to the people doing the job. They understood those fields as one piece of work and wanted to see them together.

Putting them on a well-designed form meant they could scan the information, enter it, check it and move on, and it was actually quicker to complete the task that way.

<figure>
  <img src="https://placehold.co/960x540/d1d5db/1f2937.png?text=Related+fields+on+one+form"
       alt="Placeholder for a GOV.UK-styled form with several closely related fields grouped on one page"
       title="GOV.UK-styled form with related fields grouped on one page"
       width="960"
       height="540"
       loading="lazy"
       decoding="async">
  <figcaption>What this should show: a GOV.UK-styled form with five closely related fields grouped on one page, so a caseworker can scan, enter and check the information together instead of stepping through five separate screens.</figcaption>
</figure>

The form might look slightly busier in a screenshot, but that doesn't necessarily make the experience more complicated.

## A power user can cope with more

There can be a nervousness about putting too much on a page in government services, and that's understandable. We've all seen the old internal systems containing 40 fields, 12 tiny buttons, unexplained acronyms and several different shades of grey fighting for attention.

Nobody wants to recreate those.

But there's quite a large gap between that kind of interface and giving an experienced user one question at a time.

Power users often need more information around them because they're making decisions rather than simply supplying information.

A caseworker might need to see the record they're changing while they change it.

An analyst might need search criteria, filters and results available together because they're constantly moving between them.

Somebody reviewing a case may need several related pieces of information visible at once to understand what has happened and decide what to do next.

<figure>
  <img src="https://placehold.co/960x540/d1d5db/1f2937.png?text=Record+visible+while+editing"
       alt="Placeholder for a caseworking screen with the record visible alongside the form being edited"
       title="Caseworking screen with the record visible while editing"
       width="960"
       height="540"
       loading="lazy"
       decoding="async">
  <figcaption>What this should show: a denser expert-user screen still built from GOV.UK components, with the case record visible beside the form so the user can change it without switching pages. Search criteria, filters and results could sit together in a similar way.</figcaption>
</figure>

A good interface can contain a surprising amount of information while still being clear. Hierarchy, grouping, whitespace, progressive disclosure and sensible defaults do a lot of the work here.

You can still use the GOV.UK Design System throughout. The service just starts to look a little different from the linear transactional journeys people most readily associate with GOV.UK.

## Removing repetitive work

Defaults and pre-filled information are another area where relatively small design decisions can have a disproportionately large effect.

If the service already knows something, there should be a good reason to ask the user to enter it again.

If somebody is working within a particular team, organisation or case, there may be values that can be safely carried forward. If they perform the same search regularly, let them save it. If they're applying the same action to several records, think about whether that action can be done in bulk.

And if a user has just completed one record and is working through a queue, it should be easy for them to move naturally onto the next one rather than repeatedly finding their way back to the same starting point.

I've previously designed [bulk interactions for prison staff](/projects/hmpps/) because completing the same action individually for every prisoner would have made a frequent operational task unnecessarily slow. Once you looked at how the work was actually being done, the need for a bulk interaction was fairly obvious.

<figure>
  <img src="https://placehold.co/960x540/d1d5db/1f2937.png?text=Bulk+attendance+marking"
       alt="Placeholder for a bulk attendance marking interface used by prison staff"
       title="Bulk attendance marking interface for prison staff"
       width="960"
       height="540"
       loading="lazy"
       decoding="async">
  <figcaption>What this should show: the HMPPS bulk attendance pattern, with prison staff marking attendance for several prisoners in one action rather than repeating the same task one record at a time.</figcaption>
</figure>

These sorts of things add up, particularly across large services.

Saving a few seconds on one interaction might sound trivial, but not when that interaction happens hundreds of thousands of times. Reducing repetitive input can also reduce opportunities for errors, especially where people are typing information the system already knows.

## Be careful with first impressions

There's another thing I've noticed when testing replacement services with experienced users.

Sometimes they look at a new journey and initially think it seems laborious.

A GOV.UK-style journey with several clear steps can feel slower than an old system where everything sits on one enormous screen, particularly when the person has been using that old system for years.

<figure>
  <img src="https://placehold.co/960x540/d1d5db/1f2937.png?text=Old+crowded+screen+vs+new+journey"
       alt="Placeholder comparing a crowded legacy screen with a clearer GOV.UK-style replacement journey"
       title="Old crowded internal screen compared with a new GOV.UK-style journey"
       width="960"
       height="540"
       loading="lazy"
       decoding="async">
  <figcaption>What this should show: a side-by-side comparison of a crowded legacy internal screen and a clearer GOV.UK-style replacement journey, illustrating why the new one can look slower the first time somebody sees it.</figcaption>
</figure>

The important thing is to understand what they're comparing it with.

Experienced users build up an enormous amount of familiarity with the systems they use. They know which fields can be ignored. They know that a particular error message doesn't really matter. They know which tab comes next and which button to click without consciously reading any of it.

They're not really comparing two unfamiliar services. They're comparing something new, which they still have to think about, with something they may have used thousands of times.

That first reaction still matters, but I don't think you should always take it entirely at face value.

I've often found that once people actually work through a new journey, it's much quicker than they expected and quite often significantly quicker than the system it replaces.

It's usually less fallible too.

An old system can feel fast because somebody has learnt how to race through it, even if they're relying on memory, repeatedly entering the same information, navigating around irrelevant fields or remembering a collection of workarounds along the way.

A new journey can feel more deliberate the first few times because the user is still reading and learning it. Once it becomes familiar, the unnecessary effort that has been designed out starts to become much more apparent.

That is one reason I'd be cautious about optimising an expert service entirely around somebody's immediate reaction the first time they see it.

Watch what people actually do. Measure how long the task takes. Look at where errors happen. Test again once people have had some exposure to the service. Pay attention to which parts they continue to hesitate over and which quickly become second nature.

With power users in particular, designing for how the service feels after repeated use can be just as important as designing the first encounter.

## Let the interface become familiar

Consistency helps a lot with that.

If buttons, tables, errors, filters and form controls behave predictably, users gradually stop having to think about the interface quite so much.

That's one of the strongest reasons for keeping the GOV.UK Design System as the foundation rather than immediately reaching for a bespoke admin interface.

A service can become quite sophisticated while the individual pieces remain familiar.

An analyst using an advanced search still benefits from ordinary checkboxes, radios and text inputs that work in the way they expect. A caseworker processing hundreds of cases doesn't need to learn a novel date picker just because the overall service is complex.

That means you can spend your design effort on the places where expert users genuinely need something different: better tables, bulk actions, richer filtering, saved searches, denser information displays, keyboard-friendly workflows or easier ways to move between related records.

## What simple means depends on the work

I've become slightly wary of judging the simplicity of an internal service by looking at individual screens.

A page can look incredibly simple while the overall task is tedious. Equally, a screen containing quite a lot of information can make somebody's working day considerably easier if that information is well structured and useful at that point in the task.

For somebody visiting GOV.UK once to complete an unfamiliar task, simplicity might mean answering one clearly worded question at a time.

For an analyst who spends several hours a day investigating information, it might mean being able to construct a search, review the results and take action without constantly moving backwards and forwards between pages.

For a caseworker, it might mean having everything they need to make a decision visible together.

For somebody processing repetitive records, it might mean being able to get through the work accurately without the interface continually slowing them down.

The underlying design principles are much the same in each case. You're still trying to understand the user's task, remove unnecessary work, make errors less likely and make the service accessible.

The interface can take a different shape because the work itself is different.

## Start with the Design System and adapt where the evidence takes you

My default is still to start with GOV.UK.

Use the components, follow the established patterns and take advantage of years of research, accessibility work and accumulated knowledge rather than designing your own version of government software from scratch.

Then research the service properly and pay attention to what happens when people use it repeatedly.

If users are continually entering information you already hold, look at whether you can pre-fill it.

If splitting a task across several pages is making something people do all day unnecessarily slow, try grouping the information differently.

If users need information from several places to make one decision, explore whether it can be brought together.

If they're processing things individually that could safely be handled as a group, look at bulk actions.

And if they keep opening six browser tabs to do their job, there's probably something useful to learn from that too.

<figure>
  <img src="https://placehold.co/960x540/d1d5db/1f2937.png?text=Six+browser+tabs+to+do+the+job"
       alt="Placeholder for a desktop with several browser tabs open on related case information"
       title="Six browser tabs used to assemble the information needed to do the job"
       width="960"
       height="540"
       loading="lazy"
       decoding="async">
  <figcaption>What this should show: a working desktop with six browser tabs open on related case information, showing how users currently assemble context the service does not yet bring together.</figcaption>
</figure>

The [GOV.UK guidance for internal services](https://www.gov.uk/service-manual/design/services-for-government-users) is actually quite pragmatic about this. It recognises that internal users may need to repeat tasks quickly, move between them and see more information together in order to make decisions.

That's broadly how I've come to use the Design System.

I start with the established patterns because they're usually very good. Then I adapt them where the context, the research and the reality of repeated use tell me there's a better way to support the work.
