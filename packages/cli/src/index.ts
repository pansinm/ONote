#!/usr/bin/env node

import { Command } from 'commander';
import { listCommand } from './commands/list';
import { catCommand } from './commands/cat';
import { writeCommand } from './commands/write';
import { rmCommand } from './commands/rm';
import { mvCommand } from './commands/mv';
import { appendCommand } from './commands/append';
import { searchCommand } from './commands/search';
import { mkdirCommand } from './commands/mkdir';
import { statusCommand } from './commands/status';

const program = new Command();

program
  .name('onote')
  .description('ONote — Command-line interface for your notes')
  .version('0.1.0');

// ──── onote ls ────
program
  .command('ls')
  .description('List notes in a directory')
  .argument('[path]', 'directory path (default: root)')
  .option('--json', 'output as JSON')
  .action(listCommand);

// ──── onote cat ────
program
  .command('cat <path>')
  .description('Read a note and output to stdout')
  .option('--json', 'output as JSON with metadata')
  .action(catCommand);

// ──── onote write ────
program
  .command('write <path>')
  .description('Create or overwrite a note')
  .option('-c, --content <text>', 'note content')
  .option('--file <filepath>', 'read content from a file')
  .action(writeCommand);

// ──── onote append ────
program
  .command('append <path>')
  .description('Append content to a note')
  .requiredOption('-c, --content <text>', 'content to append')
  .action(appendCommand);

// ──── onote rm ────
program
  .command('rm <path>')
  .description('Delete a note or directory')
  .action(rmCommand);

// ──── onote mv ────
program
  .command('mv <source> <dest>')
  .description('Move a note to a new directory')
  .action(mvCommand);

// ──── onote search ────
program
  .command('search <query>')
  .description('Search notes by keyword')
  .option('--json', 'output as JSON')
  .action(searchCommand);

// ──── onote mkdir ────
program
  .command('mkdir <path>')
  .description('Create a directory')
  .action(mkdirCommand);

// ──── onote status ────
program
  .command('status')
  .description('Check ONote connection status')
  .action(statusCommand);

program.parse();
