#!/usr/bin/env node

/**
 * Outline Knowledge Base CLI Client
 * Lightweight standalone client for interacting with the Outline REST API.
 * Uses native Node.js fetch (Node 18+ required). Zero external dependencies.
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

function loadConfig() {
  const envUrl = process.env.OUTLINE_URL || process.env.OUTLINE_INSTANCE_URL;
  const envToken = process.env.OUTLINE_API_KEY || process.env.OUTLINE_API_TOKEN || process.env.OUTLINE_TOKEN;

  if (envUrl && envToken) {
    return { url: envUrl.replace(/\/+$/, ''), token: envToken };
  }

  const configPaths = [
    path.join(process.cwd(), '.outline.json'),
    path.join(os.homedir(), '.config', 'outline-skill', 'config.json'),
    path.join(os.homedir(), '.outline.json')
  ];

  for (const configPath of configPaths) {
    if (fs.existsSync(configPath)) {
      try {
        const content = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        const url = (envUrl || content.url || content.instanceUrl || '').replace(/\/+$/, '');
        const token = envToken || content.token || content.apiKey;
        if (url && token) {
          return { url, token };
        }
      } catch (err) {
        // Ignore parse errors and continue
      }
    }
  }

  return {
    url: envUrl ? envUrl.replace(/\/+$/, '') : '',
    token: envToken || ''
  };
}

async function request(baseUrl, token, endpoint, body = {}, retries = 2) {
  const url = `${baseUrl}/api/${endpoint}`;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.ok === false) {
        const errorMsg = data.message || data.error || `HTTP ${response.status} ${response.statusText}`;
        throw new Error(`Outline API Error (${endpoint}): ${errorMsg}`);
      }

      return data.data;
    } catch (err) {
      if (attempt < retries && (err.name === 'TypeError' || err.message === 'fetch failed')) {
        await new Promise((r) => setTimeout(r, 600));
        continue;
      }
      const cause = err.cause ? ` (${err.cause.message || err.cause.code || err.cause})` : '';
      throw new Error(`${err.message}${cause}`);
    }
  }
}

function parseArgs(args) {
  const options = { _: [] };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      if (key.includes('=')) {
        const [k, v] = key.split('=');
        options[k] = v;
      } else if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
        options[key] = args[++i];
      } else {
        options[key] = true;
      }
    } else {
      options._.push(arg);
    }
  }
  return options;
}

function printUsage() {
  console.log(`
Outline Client CLI

Usage:
  node outline-client.mjs <command> [options]

Commands:
  auth:check                          Verify Outline API connection and authentication
  collections:list                    List all accessible collections
  collections:create --name <name>    Create a new collection
  documents:search --query <text>     Search documents across collections
  documents:info --id <id>            Get document details and markdown text
  documents:create                    Create a new document
  documents:update --id <id>          Update or append to an existing document

Options for documents:create:
  --title <title>                     Document title (required)
  --collection <collectionId>         Target collection ID (required)
  --text <markdown>                   Markdown content
  --file <path>                       Read markdown content from file
  --publish                           Publish document immediately (default: true)
  --parentDocumentId <id>             Parent document ID for nesting

Options for documents:update:
  --id <id>                           Document ID (required)
  --title <title>                     Update document title
  --text <markdown>                   Replace document text
  --append <markdown>                 Append text to existing document
  --file <path>                       Read replacement or append text from file

Global Options:
  --url <url>                         Outline base URL
  --token <token>                     Outline API Token
  --json                              Output raw JSON response
`);
}

async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);
  const command = options._[0];

  if (!command || options.help || options.h) {
    printUsage();
    process.exit(0);
  }

  const loadedConfig = loadConfig();
  const baseUrl = (options.url || loadedConfig.url || '').replace(/\/+$/, '');
  const token = options.token || loadedConfig.token;

  if (!baseUrl || !token) {
    console.error('Error: Outline URL or API Token not found.');
    console.error('Please configure via environment variables (OUTLINE_URL, OUTLINE_API_KEY)');
    console.error('or run: npx -y github:huangy7/outline-skill setup');
    process.exit(1);
  }

  try {
    switch (command) {
      case 'auth:check': {
        const data = await request(baseUrl, token, 'auth.info');
        if (options.json) {
          console.log(JSON.stringify(data, null, 2));
        } else {
          console.log('Authentication Successful');
          console.log(`User: ${data.user?.name} (${data.user?.email})`);
          console.log(`Team: ${data.team?.name} (${baseUrl})`);
        }
        break;
      }

      case 'collections:list': {
        const data = await request(baseUrl, token, 'collections.list', { limit: 100 });
        if (options.json) {
          console.log(JSON.stringify(data, null, 2));
        } else {
          console.log(`Found ${data.length} collections:`);
          for (const col of data) {
            console.log(`- [${col.id}] ${col.name} (${col.permission || 'read_write'})`);
          }
        }
        break;
      }

      case 'collections:create': {
        const name = options.name;
        if (!name) {
          console.error('Error: --name is required for collections:create');
          process.exit(1);
        }
        const description = options.description || '';
        const data = await request(baseUrl, token, 'collections.create', {
          name,
          description,
          permission: 'read_write'
        });
        if (options.json) {
          console.log(JSON.stringify(data, null, 2));
        } else {
          console.log(`Collection created: ${data.name} (ID: ${data.id})`);
        }
        break;
      }

      case 'documents:search': {
        const query = options.query || options.q;
        if (!query) {
          console.error('Error: --query is required for documents:search');
          process.exit(1);
        }
        const payload = { query };
        if (options.collection) {
          payload.collectionId = options.collection;
        }
        const data = await request(baseUrl, token, 'documents.search', payload);
        if (options.json) {
          console.log(JSON.stringify(data, null, 2));
        } else {
          console.log(`Found ${data.length} search results for "${query}":`);
          for (const item of data) {
            const doc = item.document;
            console.log(`- [${doc.id}] ${doc.title} (Collection: ${doc.collectionId})`);
            if (item.ranking) {
              console.log(`  Relevance: ${item.ranking}`);
            }
          }
        }
        break;
      }

      case 'documents:info': {
        const id = options.id;
        if (!id) {
          console.error('Error: --id is required for documents:info');
          process.exit(1);
        }
        const data = await request(baseUrl, token, 'documents.info', { id });
        if (options.json) {
          console.log(JSON.stringify(data, null, 2));
        } else {
          console.log(`Title: ${data.title}`);
          console.log(`ID: ${data.id}`);
          console.log(`Collection ID: ${data.collectionId}`);
          console.log(`Created: ${data.createdAt} | Updated: ${data.updatedAt}`);
          console.log('--- Content ---');
          console.log(data.text);
        }
        break;
      }

      case 'documents:create': {
        const title = options.title;
        const collectionId = options.collection;
        if (!title || !collectionId) {
          console.error('Error: --title and --collection are required for documents:create');
          process.exit(1);
        }

        let text = options.text || '';
        if (options.file && fs.existsSync(options.file)) {
          text = fs.readFileSync(options.file, 'utf8');
        }

        const payload = {
          title,
          collectionId,
          text,
          publish: options.publish !== false && options.publish !== 'false'
        };

        if (options.parentDocumentId) {
          payload.parentDocumentId = options.parentDocumentId;
        }

        const data = await request(baseUrl, token, 'documents.create', payload);
        if (options.json) {
          console.log(JSON.stringify(data, null, 2));
        } else {
          console.log(`Document created successfully:`);
          console.log(`Title: ${data.title}`);
          console.log(`ID: ${data.id}`);
          const docPath = data.url || `/doc/${data.urlId || data.id}`;
          console.log(`URL: ${baseUrl}${docPath.startsWith('/') ? '' : '/'}${docPath}`);
        }
        break;
      }

      case 'documents:update': {
        const id = options.id;
        if (!id) {
          console.error('Error: --id is required for documents:update');
          process.exit(1);
        }

        const payload = { id };
        if (options.title) {
          payload.title = options.title;
        }

        let content = options.text;
        if (options.file && fs.existsSync(options.file)) {
          content = fs.readFileSync(options.file, 'utf8');
        }

        if (options.append) {
          payload.append = true;
          payload.text = options.append;
        } else if (content !== undefined) {
          payload.text = content;
        }

        const data = await request(baseUrl, token, 'documents.update', payload);
        if (options.json) {
          console.log(JSON.stringify(data, null, 2));
        } else {
          console.log(`Document updated successfully:`);
          console.log(`Title: ${data.title}`);
          console.log(`ID: ${data.id}`);
          const docPath = data.url || `/doc/${data.urlId || data.id}`;
          console.log(`URL: ${baseUrl}${docPath.startsWith('/') ? '' : '/'}${docPath}`);
        }
        break;
      }

      default:
        console.error(`Unknown command: ${command}`);
        printUsage();
        process.exit(1);
    }
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

main();
