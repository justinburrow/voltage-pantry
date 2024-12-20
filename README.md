# ECI - Electronic Component Inventory
>*or "help i can't stop ordering the wrong things for the projects that i haven't started yet "*

**Electronic Component Inventory.** Multi-faceted hosted database application built to solve critical quality-of-life problems, such as:
- I'm pretty sure I bought like 5 of those A100k pots recently. Am I really out?
- Glad I got a box of components in the mail. Wish I could remember if I needed these parts for something or if it's just general restock.
- I'm placing a small order at a vendor and should fill out some more items to make the most of the shipping charge I have to pay. What am I almost out of and what do I need coming up?
- There's only THREE places I ever put components in, and I can't, for the life of me, remember which place I put it in, and all three of them would take hours to go through.
- Ok fine, I'm out of 11k resistors. Do I have any 10k's in stock?

## Tech Stack
- Svelte 5 + Typescript
- Supabase
- Tailwind
- Shadcn-Svelte components

### Feature Overview
- **Personal component inventory management**
  - Logging Locations (i.e. which bag I stuck it in and which drawer it lives in)
  - Component primary values and secondary facets
- **Project-based Inventory Allocation**
  - Overview of active projects and the inventory needed to complete them
  - Soft allocating inventory and logging which Project they're marked for
  - Assigning incoming inventory to waiting Projects on a priority-basis
- **Component Search**
  - Fuzzy, handles 1k or 1000r or 0.10M (who even uses that)
  - Can return "close enough" values set by specified ranges
  - Shows status of available inventory - whether truly free or available, but kind of meant for that one thing...


