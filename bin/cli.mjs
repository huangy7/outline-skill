#!/usr/bin/env node

/**
 * Outline Skill CLI Setup Wizard
 * Guides the user through configuring Outline credentials and installing
 * the skill into supported AI Agent environments.
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

function askQuestion(rl, query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function verifyOutline(url, token) {
  const endpoint = `${url.replace(/\/+$/, '')}/api/auth.info`;
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({})
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.ok !== false) {
      return { success: true, user: data.data?.user?.name, team: data.data?.team?.name };
    }
    return { success: false, error: data.message || `HTTP ${res.status} ${res.statusText}` };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function copyDirRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.name === '.git' || entry.name === 'node_modules') {
      continue;
    }

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function runSetup() {
  console.log('========================================');
  console.log('  Outline Skill Setup Wizard');
  console.log('========================================\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  try {
    const urlInput = await askQuestion(rl, 'Outline Instance URL (e.g. https://outline.yourcompany.com): ');
    const instanceUrl = urlInput.trim().replace(/\/+$/, '');

    if (!instanceUrl) {
      console.error('Error: Outline URL cannot be empty.');
      process.exit(1);
    }

    const tokenInput = await askQuestion(rl, 'Outline API Token: ');
    const apiToken = tokenInput.trim();

    if (!apiToken) {
      console.error('Error: API Token cannot be empty.');
      process.exit(1);
    }

    console.log('\nVerifying credentials...');
    const verification = await verifyOutline(instanceUrl, apiToken);

    if (!verification.success) {
      console.error(`Verification failed: ${verification.error}`);
      console.error('Please check your URL and API Token and try again.');
      process.exit(1);
    }

    console.log(`Verification successful!`);
    console.log(`Connected to Team: ${verification.team}`);
    console.log(`Authenticated as User: ${verification.user}\n`);

    // 1. Save configuration to ~/.config/outline-skill/config.json
    const configDir = path.join(os.homedir(), '.config', 'outline-skill');
    fs.mkdirSync(configDir, { recursive: true });
    const configPath = path.join(configDir, 'config.json');

    fs.writeFileSync(
      configPath,
      JSON.stringify(
        {
          url: instanceUrl,
          token: apiToken,
          team: verification.team,
          user: verification.user,
          updatedAt: new Date().toISOString()
        },
        null,
        2
      )
    );
    console.log(`Configuration saved to: ${configPath}`);

    // 2. Detect Agent runtimes
    const home = os.homedir();
    const candidatePaths = [
      { name: 'Google Antigravity / Gemini CLI', path: path.join(home, '.gemini', 'config', 'skills', 'outline-wiki') },
      { name: 'Claude Code', path: path.join(home, '.claude', 'skills', 'outline-wiki') },
      { name: 'Universal Agent Skills', path: path.join(home, '.agents', 'skills', 'outline-wiki') }
    ];

    console.log('\nInstalling skill into local agent directories:');
    let installedCount = 0;

    for (const candidate of candidatePaths) {
      const parentDir = path.dirname(candidate.path);
      if (fs.existsSync(parentDir)) {
        copyDirRecursive(projectRoot, candidate.path);
        console.log(`- Installed for ${candidate.name}: ${candidate.path}`);
        installedCount++;
      }
    }

    if (installedCount === 0) {
      const defaultDest = candidatePaths[0].path;
      copyDirRecursive(projectRoot, defaultDest);
      console.log(`- Installed into default path: ${defaultDest}`);
    }

    console.log('\n========================================');
    console.log('Setup completed successfully!');
    console.log('You can now ask your AI Agent:');
    console.log('  "Help me organize this troubleshooting process into Outline"');
    console.log('  "Search my Outline notes for Docker deployment"');
    console.log('========================================\n');
  } finally {
    rl.close();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'setup';

  if (command === 'setup' || command === 'install') {
    await runSetup();
  } else {
    console.log('Usage: npx -y github:huangy7/outline-skill [setup|install]');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
