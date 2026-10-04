import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { Organizer } from '../lib/organizer.js';

describe('Organizer Module', () => {
	let sourceDir;
	let targetDir;

	beforeEach(async () => {
		sourceDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-org-src-'));
		targetDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-org-tgt-'));
	});

	afterEach(async () => {
		await fs.rm(sourceDir, { recursive: true, force: true });
		await fs.rm(targetDir, { recursive: true, force: true });
	});

	test('розподіляє файли за відповідними категоріями', async () => {
		await fs.writeFile(path.join(sourceDir, 'doc.pdf'), 'PDF data');
		await fs.writeFile(path.join(sourceDir, 'photo.jpg'), 'JPG data');
		await fs.writeFile(path.join(sourceDir, 'script.js'), 'console.log()');
		await fs.writeFile(path.join(sourceDir, 'unknown.xyz'), 'Unknown data');

		const organizer = new Organizer();
		const summary = await organizer.organize(sourceDir, targetDir);

		assert.equal(summary.totalCopied, 4);
		assert.equal(summary.byCategory.Documents, 1);
		assert.equal(summary.byCategory.Images, 1);
		assert.equal(summary.byCategory.Code, 1);
		assert.equal(summary.byCategory.Other, 1);

		// Перевірка існування файлів у цільових папках
		const pdfExists = await fs.stat(path.join(targetDir, 'Documents', 'doc.pdf'));
		assert.ok(pdfExists.isFile());

		const otherExists = await fs.stat(path.join(targetDir, 'Other', 'unknown.xyz'));
		assert.ok(otherExists.isFile());
	});

	test('додає суфікс (1), (2), якщо файл у цільовій папці вже існує', async () => {
		await fs.writeFile(path.join(sourceDir, 'file.txt'), 'Source file');

		// Створення вже існуючого файла у папці призначення
		const docsDir = path.join(targetDir, 'Documents');
		await fs.mkdir(docsDir, { recursive: true });
		await fs.writeFile(path.join(docsDir, 'file.txt'), 'Existing file');

		const organizer = new Organizer();
		await organizer.organize(sourceDir, targetDir);

		const renamedFileExists = await fs.stat(path.join(docsDir, 'file(1).txt'));
		assert.ok(renamedFileExists.isFile());
	});
});
