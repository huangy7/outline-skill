# Outline Knowledge Base Workflows

This document outlines the standard operating procedures for an AI Agent managing documents in Outline.

---

## Workflow 1: Turning Conversations / Debugging Sessions into a Runbook

When the user asks to summarize a recent troubleshooting, deployment, or debugging session:

1. **Extract Core Metadata**:
   - Title: Clear, action-oriented (e.g., "Docker 部署 Outline 升级排障与实操指南").
   - Summary: 2-3 sentences explaining the background and problem.
2. **Structure the Document**:
   - `## 背景与环境` (Architecture, components, software versions).
   - `## 前置准备与数据备份` (Crucial backup steps with exact commands).
   - `## 详细操作步骤` (Numbered steps with fenced code blocks).
   - `## 验证与健康检查` (How to confirm success, check logs, test endpoints).
   - `## 常见问题与回滚方案` (Troubleshooting tips and rollback instructions).
3. **Target Collection**:
   - Search available collections (`collections:list`).
   - Pick the most relevant collection (e.g., "运维知识库", "技术方案", or "DevOps").
4. **Publish**:
   - Check if an existing document with the same topic exists (`documents:search`).
   - If found, ask user whether to update or create a new edition.
   - If not found, call `documents:create`.

---

## Workflow 2: Updating an Existing Document

When the user wants to add content or update a document:

1. **Retrieve Document**:
   - Search for the document by keywords (`documents:search --query <keywords>`).
   - Retrieve full content (`documents:info --id <id>`).
2. **Review & Merge**:
   - Read the existing markdown text.
   - Intelligently place new content into the appropriate section, or append if it is a log/timeline entry.
3. **Execute Update**:
   - Call `documents:update --id <id> --text <updated_markdown>`.
   - Report the updated document URL to the user.

---

## Workflow 3: Cross-Document Linking & Organization

1. When mentioning related systems or topics that may already exist in the Outline workspace, run a quick search (`documents:search`).
2. If related documents are found, insert internal Outline markdown links in the format:
   `[相关文档标题](/doc/<urlId>)`.
3. Keep navigation intuitive and connected.
