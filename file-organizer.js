#!/usr/bin/env node

import path from 'path';
import { Scanner } from './lib/scanner.js';
import { DuplicateFinder } from './lib/duplicates.js';
import { Organizer } from './lib/organizer.js';
import { Cleanup } from './lib/cleanup.js';

function formatSize(bytes) {
	if (bytes < 1024) {
		return `${bytes} B`;
	} else if (bytes < 1024 * 1024) {
		return `${(bytes / 1024).toFixed(1)} KB`;
	} else if (bytes < 1024 * 1024 * 1024) {
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	} else {
		return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
	}
}

function drawProgressBar(current, total, width = 20) {
	if (total === 0) return '████████████████████ 0/0';
	const percentage = Math.min(1, current / total);
	const filled = Math.round(percentage * width);
	const bar = '█'.repeat(filled) + '░'.repeat(width - filled);
	return `${bar} ${current}/${total}`;
}

const args = process.argv.slice(2);
const command = args[0];

if (!command) {
	console.log('Usage: file-organizer  [options]');
	console.log('Commands: scan, duplicates, organize, cleanup');
	process.exit(0);
}

switch (command) {
	case 'scan': {
		const dir = args[1];
		if (!dir) {
			console.error('❌ Error: Please specify a directory to scan.');
			process.exit(1);
		}

		const scanner = new Scanner();

		scanner.on('scan-start', (data) => {
			console.log(`📂 Scanning: ${data.directory}`);
		});

		scanner.on('file-error', (data) => {
			console.error(`\n⚠️ Skipped: ${path.basename(data.path)} (${data.error})`);
		});

		scanner.on('file-found', (data) => {
			process.stdout.write(`Processing... ${drawProgressBar(data.current, data.total)} files\r`);
		});

		scanner.on('scan-complete', (res) => {
			console.log('\n');
			console.log('📊 Scan Results:');
			console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
			console.log(`Total files: ${res.totalFiles}`);
			console.log(`Total size: ${formatSize(res.totalSize)}\n`);

			console.log('By File Type:');
			for (const [type, info] of res.byType.entries()) {
				console.log(`  ${type.padEnd(10)}	 ${info.count.toString().padStart(4)} files   ${formatSize(info.totalSize)}`);
			}

			console.log('\nFile Age:');
			console.log(`  Last 7 days:   ${res.age.last7Days} files`);
			console.log(`  Last 30 days:  ${res.age.last30Days} files`);
			console.log(`  Older than 90: ${res.age.olderThan90} files`);

			console.log('\nLargest files:');
			res.largestFiles.forEach((file, index) => {
				console.log(`  ${index + 1}  ${path.basename(file.path)} ${formatSize(file.size)}`);
			});

			if (res.oldestFile) {
				const daysAgo = Math.floor((Date.now() - res.oldestFile.mtime.getTime()) / (1000 * 60 * 60 * 24));
				console.log(`\nOldest file: ${path.basename(res.oldestFile.path)} (modified ${daysAgo} days ago)`);
			}
		});

		await scanner.scan(dir);
		break;
	}

	case 'duplicates': {
		const dir = args[1];
		if (!dir) {
			console.error('❌ Error: Please specify a directory.');
			process.exit(1);
		}

		const finder = new DuplicateFinder();

		finder.on('search-start', (data) => {
			console.log(`🔍 Searching for duplicates in: ${data.directory}`);
		});

		finder.on('file-processed', (data) => {
			process.stdout.write(`Calculating hashes... ${drawProgressBar(data.current, data.total)} files\r`);
		});

		finder.on('file-error', (data) => {
			console.error(`\n⚠️ Skipped: ${path.basename(data.path)} ${data.error})`);
		});

		finder.on('duplicates-found', (res) => {
			console.log('\n');
			if (res.duplicateGroups.length === 0) {
				console.log('✅ No duplicates found!');
				return;
			}

			console.log(`Found  ${res.duplicateGroups.length} duplicate groups (${formatSize(res.totalWastedSpace)} wasted):\n`);

			res.duplicateGroups.forEach((group, index) => {
				console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
				console.log(`Group ${index + 1} (${group.paths.length} copies, ${formatSize(group.size)} each):`);
				console.log(`SHA-256: ${group.hash.substring(0, 16)}...`);
				console.log('');
				group.paths.forEach((p) => console.log(`  📄 ${p}`));
				console.log(`\nWasted space: ${formatSize(group.wastedSpace)}\n`);
			});

			console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
			console.log(`💾 Total wasted space: ${formatSize(res.totalWastedSpace)}`);
		});

		await finder.findDuplicates(dir);
		break;
	}

	case 'organize': {
		const sourceDir = args[1];
		const outputIndex = args.indexOf('--output');

		let targetDir = null;
		if (outputIndex !== -1 && args[outputIndex + 1]) {
			targetDir = args[outputIndex + 1];
		} else if (args[2] && !args[2].startsWith('--')) {
			targetDir = args[2];
		}

		if (!sourceDir || !targetDir) {
			console.error('❌ Error: Syntax: node file-organizer.js organize  --output ');
			process.exit(1);
		}

		const organizer = new Organizer();

		organizer.on('organize-start', (data) => {
			console.log(`📦 Organizing: ${data.source}`);
			console.log(`Target: ${data.target}\n`);
			console.log('Creating folders...');
			console.log('  ✓ Documents/\n  ✓ Images/\n  ✓ Archives/\n  ✓ Code/\n  ✓ Videos/\n  ✓ Other/\n');
			console.log('Copying files...');
		});

		organizer.on('copy-complete', (data) => {
			process.stdout.write(`Processing... ${drawProgressBar(data.current, data.total)}\r`);
		});

		organizer.on('copy-error', (data) => {
			console.error(`\n⚠️ Skipped: ${data.file} ${data.error})`);
		});
		organizer.on('organize-complete', (res) => {
			console.log('\n');
			console.log('✅ Organization complete!\n');
			console.log('Summary:');
			for (const [cat, count] of Object.entries(res.byCategory)) {
				console.log(`  ${cat.padEnd(10)}:${count} files -> Organized/${cat}/`);
			}
			console.log(`\nTotal copied: ${res.totalCopied} files (${formatSize(res.totalSize)})`);
		});

		await organizer.organize(sourceDir, targetDir);
		break;
	}

	case 'cleanup': {
		const dir = args[1];
		const olderThanIdx = args.indexOf('--older-than');

		let days = null;
		if (olderThanIdx !== -1 && args[olderThanIdx + 1]) {
			days = parseInt(args[olderThanIdx + 1], 10);
		} else {
			const numericArg = args.find((arg) => !isNaN(parseInt(arg, 10)) && arg !== dir);
			if (numericArg) {
				days = parseInt(numericArg, 10);
			}
		}

		const isConfirm = args.includes('--confirm');
		if (!dir || !days || isNaN(days)) {
			console.error('❌ Error: Syntax: node file-organizer.js cleanup  --older-than  [--confirm]');
			process.exit(1);
		}

		const cleanup = new Cleanup();

		cleanup.on('cleanup-start', (data) => {
			console.log(`🧹 Cleanup: ${data.directory}`);
			console.log(`Looking for files older than ${data.days} days...\n`);
		});

		cleanup.on('dry-run-complete', (res) => {
			console.log(`Found ${res.candidates.length} files to delete:\n`);
			console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

			res.candidates.forEach((item) => {
				const dateStr = item.mtime.toISOString().split('T')[0];
				console.log(`📄 ${path.basename(item.path)} | Size:${formatSize(item.size)} | Modified: ${item.daysOld} days ago (${dateStr})`);
			});

			console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
			console.log(`Total: ${res.candidates.length} files (${formatSize(res.totalSize)})`);
			console.log('\n⚠️ DRY RUN MODE: No files were deleted. To actually delete these files, run with --confirm flag.');
		});

		cleanup.on('cleanup-start-deleting', (res) => {
			console.log(`Found ${res.candidates.length} files to delete:\n`);
			console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

			res.candidates.forEach((item) => {
				const dateStr = item.mtime.toISOString().split('T')[0];
				console.log(`📄 ${path.basename(item.path)} Size:${formatSize(item.size)} Modified: ${item.daysOld} days ago (${dateStr})`);
			});

			console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
			console.log(`⚠️ DELETING ${res.candidates.length} files (${formatSize(res.totalSize)}). This action cannot be undone!\n`);
		});

		cleanup.on('file-deleted', (data) => {
			process.stdout.write(`Deleting... ${drawProgressBar(data.current, data.total)}\r`);
		});

		cleanup.on('cleanup-complete', (res) => {
			console.log('\n');
			console.log(`✅ Cleanup complete! Deleted: ${res.deletedCount} files (${formatSize(res.deletedSize)} freed)`);
		});

		await cleanup.cleanup(dir, days, isConfirm);
		break;
	}

	default:
		console.error(`❌ Unknown command: ${command}`);
		process.exit(1);
}
