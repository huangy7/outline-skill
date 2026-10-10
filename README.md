# outline-skill

An open-source Agent Skill and CLI tool for managing, formatting, and organizing notes and knowledge base documentation in [Outline](https://www.getoutline.com/).

Built for AI coding agents such as **Google Antigravity**, **Claude Code**, **Cursor**, **Codex**, and any agent adhering to the [Agent Skills specification](https://agentskills.io/).

---

## Key Features

- **Standard Agent Skill Specification**: Fully compliant with `agentskills.io` standard, discoverable by `npx skills` and modern AI coding assistants.
- **Outline Formatting Guardrails**:
  - Automatically eliminates title duplication (prevents awkward leading `# Title` collision).
  - Natively structures Outline callouts (`:::info`, `:::tip`, `:::warning`, `:::danger`).
  - Ensures proper language tagging for code blocks and clean table alignments.
- **Dual-Engine Architecture**:
  - **Native MCP Support**: Seamlessly leverages Outline's built-in Model Context Protocol tools (`list_documents`, `create_document`, etc.) if configured.
  - **Zero-Dependency CLI Fallback**: Bundles a standalone Node.js client (`scripts/outline-client.mjs`) using native `fetch` (Node 18+) that works out-of-the-box without requiring an MCP server.
- **Intelligent Knowledge Workflows**:
  - Automatically transforms chat/debugging/troubleshooting sessions into structured runbooks.
  - Checks for existing notes before creation to prevent redundant pages.
  - Automatically files documents into appropriate collections (knowledge bases).

---

## Installation

### Option 1: Universal Install via `skills` CLI (Recommended)

Install globally across supported AI agents using the community standard `skills` tool:

```bash
npx skills add huangy7/outline-skill -g
```

Or install for a specific agent:

```bash
# For Claude Code
npx skills add huangy7/outline-skill --agent claude-code

# For Google Antigravity / Gemini CLI
npx skills add huangy7/outline-skill --agent gemini-cli
```

### Option 2: Interactive Setup Wizard

Run the interactive setup wizard to configure credentials and auto-install into local agent directories:

```bash
npx -y github:huangy7/outline-skill setup
```

> This runs the wizard straight from the GitHub repository, so it works without the package being published to npm.

The wizard will prompt for:
1. Outline Instance URL (e.g., `https://note.yourdomain.com` or `https://app.getoutline.com`)
2. API Token (created in Outline under `Settings` -> `Account` -> `API Tokens`)
3. Automatically validates connection via `auth.info` and saves configuration.

### Option 3: Manual Clone

Clone directly into your agent's skills directory:

```bash
# For Google Antigravity
git clone https://github.com/huangy7/outline-skill.git ~/.gemini/config/skills/outline-wiki

# For Claude Code
git clone https://github.com/huangy7/outline-skill.git ~/.claude/skills/outline-wiki

# For Universal Agent Skills
git clone https://github.com/huangy7/outline-skill.git ~/.agents/skills/outline-wiki
```

---

## Configuration

Credentials can be provided through either environment variables or a configuration file.

### Environment Variables

```bash
export OUTLINE_URL="https://note.yourdomain.com"
export OUTLINE_API_KEY="ol_api_xxxxxxxxxxxxxxxxxxxx"
```

### Configuration File

Create `~/.config/outline-skill/config.json`:

```json
{
  "url": "https://note.yourdomain.com",
  "token": "ol_api_xxxxxxxxxxxxxxxxxxxx"
}
```

---

## Usage in Conversations

Once installed, simply instruct your AI Agent naturally:

- *"Please summarize our Docker upgrade process and create a runbook in my Outline DevOps collection."*
- *"Search Outline for our database backup policy."*
- *"Format and update the troubleshooting note for container networking in Outline."*
- *"Review our meeting discussion and draft a specification note in Outline."*

The agent will automatically load the skill, check existing collections and documents, apply Outline-tailored formatting, and save the result.

---

## Standalone CLI Usage

The bundled client can also be invoked directly from the terminal or in CI/CD scripts:

```bash
# Check authentication
node scripts/outline-client.mjs auth:check

# List collections
node scripts/outline-client.mjs collections:list

# Search documents
node scripts/outline-client.mjs documents:search --query "Docker"

# Create a document
node scripts/outline-client.mjs documents:create \
  --title "Server Maintenance Guide" \
  --collection "<collection-id>" \
  --file "./guide.md"

# Append to an existing document
node scripts/outline-client.mjs documents:update \
  --id "<document-id>" \
  --append "### Changelog\n- Updated on 2026-10-09"
```

---

## Project Structure

```text
outline-skill/
├── SKILL.md                 # Agent Skills specification entrypoint
├── package.json             # npm package & bin configuration
├── bin/
│   └── cli.mjs              # Interactive setup wizard
├── scripts/
│   └── outline-client.mjs   # Standalone Node.js Outline REST API client
├── references/
│   ├── formatting-guide.md  # Outline markdown conventions & callouts
│   └── workflows.md         # Document management workflows
├── LICENSE                  # MIT License
└── README.md                # Documentation
```

---

## Contributing

Contributions, bug reports, and suggestions are welcome. Please open an issue or pull request on GitHub.

## License

MIT License. See [LICENSE](./LICENSE) for details.
