# Custom Sections Guide

## Overview

Sections are now **completely dynamic**! You can add any section name you want, not just the predefined ones.

## How to Add Custom Sections

### Method 1: From Resume Structure

1. Click the **"Add Section"** button
2. You'll see suggested sections (SUMMARY, EDUCATION, etc.)
3. At the bottom of the menu, click **"Custom Section..."**
4. Type your custom section name (e.g., "VOLUNTEERING", "HOBBIES", "REFERENCES")
5. Press **Enter** or click the ✓ check icon
6. Your custom section is added!

### Method 2: From Block Creation

1. Click **"New"** in the Block Library
2. Under "Section Type", click the dropdown
3. At the bottom, click **"Custom..."**
4. Type your custom section name
5. Create your block with the custom section

## Features

### Suggested Sections
Common sections are suggested for quick access:
- SUMMARY
- EDUCATION
- EXPERIENCE
- PROJECTS
- SKILLS
- ACHIEVEMENTS
- CERTIFICATIONS
- AWARDS
- PUBLICATIONS
- LANGUAGES
- INTERESTS

### Automatic Icon Generation
Every section gets a unique icon based on its first 2 letters:
- SUMMARY → **SU**
- EDUCATION → **ED**
- VOLUNTEERING → **VO**
- CUSTOM_NAME → **CU**

### No Limits
- Add as many sections as you want
- Use any name (will be converted to UPPERCASE)
- No restrictions on naming

## Examples of Custom Sections

```
VOLUNTEERING
HOBBIES
REFERENCES
EXTRACURRICULARS
PROFESSIONAL_DEVELOPMENT
LEADERSHIP
COMMUNITY_SERVICE
MILITARY_SERVICE
LICENSES
PATENTS
RESEARCH
TEACHING
CONSULTING
```

## Section Management

### Rename a Section
1. Delete the old section (removes from resume, not blocks)
2. Add a new section with the desired name
3. Re-add the blocks

### Delete a Section
1. Click the three-dot menu (⋮) on the section header
2. Select "Remove Section"
3. Blocks remain in Block Library (only the section is removed)

### Reorder Sections
- Drag sections by the grip icon (≡) on the left
- Drop to reorder

## Block Library Filtering

The tab filters at the top of Block Library automatically update to show all section types that have blocks:
- **ALL** - Shows all blocks
- Dynamic tabs for each section type with blocks

If you create a block with section type "VOLUNTEERING", a "VOLUNTEERING" tab will appear automatically.

## Tips

1. **Use descriptive names**: "LEADERSHIP" instead of "MISC"
2. **Stay consistent**: If you use "EXTRACURRICULARS", don't also use "ACTIVITIES"
3. **Think about order**: Traditional resume order is:
   - SUMMARY → EDUCATION → EXPERIENCE → PROJECTS → SKILLS
   - But you can organize however you want!

4. **ATS-friendly**: Most ATS systems can handle custom section names, just keep them clear and professional

## Technical Notes

- Section names are automatically converted to UPPERCASE
- Whitespace is trimmed
- Duplicate section names are not allowed
- Section names are stored as-is in the database
- Icons are generated dynamically (first 2 characters)
