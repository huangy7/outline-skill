# Outline Markdown Formatting Guide

This guide describes formatting conventions tailored specifically for the Outline knowledge base.

---

## 1. Title Convention (Critical)

In Outline, the document title is a first-class field separate from the document body text.

- **Do NOT begin the markdown content with a top-level `# Title` heading.**
- Doing so creates an awkward duplicate title at the top of the rendered page.
- Start directly with an introductory summary paragraph, or begin with a second-level heading (`## Section Name`).

---

## 2. Callouts and Alerts

Outline natively supports stylized callout blocks for emphasizing key points:

```markdown
:::info
Background information, context, or neutral notes.
:::

:::tip
Pro-tips, best practices, and optimization recommendations.
:::

:::warning
Important notices, prerequisites, or potential caveats.
:::

:::danger
High-risk warnings, destructive actions, or data loss cautions.
:::
```

---

## 3. Structure and Hierarchy

Use clear hierarchical headings to ensure auto-generated Table of Contents renders cleanly:

- `## 1. Overview` (Major section)
- `### 1.1 Context` (Subsection)
- `#### Details` (Sub-subsection)

Avoid skipping heading levels (e.g., jumping from `##` to `####`).

---

## 4. Code Blocks and Commands

Always specify the language identifier on fenced code blocks for syntax highlighting:

```bash
# Example bash commands
docker compose pull
docker compose up -d
```

```yaml
# Example YAML configuration
version: '3'
services:
  app:
    image: example:latest
```

---

## 5. Checklists and Task Lists

Use standard markdown task list syntax for action items, verification checklists, or runbook steps:

```markdown
- [x] Step 1: Backup database
- [x] Step 2: Update configuration in .env
- [ ] Step 3: Verify healthy status on healthcheck endpoint
```

---

## 6. Tables

Use standard GitHub Flavored Markdown tables with clear header alignment:

```markdown
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| OUTLINE_URL | string | Yes | Outline instance base URL |
| OUTLINE_API_KEY | string | Yes | Bearer token generated from Settings |
```
