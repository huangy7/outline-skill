---
name: outline-wiki
description: Use when the user wants to search, read, create, update, organize, or format notes and documentation in an Outline knowledge base.
---

# Outline Wiki Skill

This skill guides the AI Agent in searching, reading, drafting, formatting, and organizing documentation and notes in an Outline knowledge base (`getoutline.com` or self-hosted).

---

## 1. Prerequisites and Configuration Check

Before performing operations, verify that Outline credentials are configured:

1. **Environment Variables**: `OUTLINE_URL` (or `OUTLINE_INSTANCE_URL`) and `OUTLINE_API_KEY` (or `OUTLINE_TOKEN`).
2. **Config File**: `~/.config/outline-skill/config.json` containing `{ "url": "...", "token": "..." }`.

If credentials are not found:
- Ask the user for their Outline Instance URL and API Token (generated in Outline under Settings -> Account -> API Tokens).
- Or suggest running: `npx -y github:huangy7/outline-skill setup` in their terminal.

To verify connectivity:
```bash
node scripts/outline-client.mjs auth:check
```

---

## 2. Core Operation Modes

The Agent can interact with Outline via two complementary methods:

### Mode A: Via Native MCP Tools (When Available)
If the current agent environment has Outline MCP server configured, prefer using the registered tools:
- `list_documents` / `list_collection_documents`: Search or browse documents.
- `create_document`: Create a new document in a collection.
- `update_document`: Edit or append text to an existing document.
- `list_collections`: List collections to identify the appropriate target collection.

### Mode B: Via Bundled CLI Client (Universal Fallback)
If MCP tools are not active in the session, use the bundled standalone script `scripts/outline-client.mjs`:
```bash
# List collections
node scripts/outline-client.mjs collections:list

# Search documents
node scripts/outline-client.mjs documents:search --query "关键字"

# View document details
node scripts/outline-client.mjs documents:info --id "<documentId>"

# Create document
node scripts/outline-client.mjs documents:create --title "<标题>" --collection "<collectionId>" --file "<path-to-markdown>"

# Update or append document
node scripts/outline-client.mjs documents:update --id "<documentId>" --append "<追加文本>"
```

---

## 3. Formatting Conventions for Outline

When preparing document content, strictly follow these rules:

1. **Do NOT Start with Top-Level Heading (`# Title`)**:
   - Outline stores the title as a separate metadata field and renders it automatically.
   - Starting markdown with `# Title` produces an awkward duplicate title.
   - Start directly with an introductory overview paragraph or a second-level heading (`## 概述`).
2. **Use Outline Callouts for Highlights**:
   - `:::info`: General tips, context, or neutral notes.
   - `:::tip`: Pro-tips and best practices.
   - `:::warning`: Important alerts and caveats.
   - `:::danger`: High-risk operations or potential data loss warnings.
3. **Structured Hierarchy**:
   - Use `##` for primary sections, `###` for subsections.
   - Ensure all code blocks specify their language tag (e.g. ````bash`, ````yaml`, ````json`).
   - Use checklist tasks `- [ ]` and `- [x]` for operational checklists and runbooks.
   - Detailed formatting guidelines are available in `references/formatting-guide.md`.

---

## 4. Standard Note-Taking Workflows

### Workflow: Turning Conversations into Knowledge Base Articles
1. **Analyze and Structure**: Extract key concepts, problem statements, solutions, commands, and lessons learned.
2. **Search for Duplicates**: Search existing documents using `documents:search` to avoid duplicate notes.
3. **Select or Create Collection**: Browse available collections (`collections:list`). Choose the best fit (e.g., "运维笔记", "开发文档").
4. **Draft and Review**: Draft the document adhering to the formatting conventions above.
5. **Publish**: Call `documents:create` (or MCP `create_document`). Return the created document URL to the user.

### Workflow: Updating Existing Knowledge Base Pages
1. Retrieve existing document content with `documents:info`.
2. Seamlessly integrate new sections, updates, or append changelog entries.
3. Call `documents:update` to save modifications.
