import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { Cleanup } from '../lib/cleanup.js';

describe('Cleanup Module', () => {
	let tmpDir;

	beforeEach(async () => {
		tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-cleanup-'));
	});

	afterEach(async () => {
		await fs.rm(tmpDir, { recursive: true, force: true });
	});

	test('Dry Run mode: знаходить старі файли, але НЕ видаляє їх', async () => {
		const file = path.join(tmpDir, 'old_file.txt');
		await fs.writeFile(file, 'Old Data');

		// Робимо файл "старим" (100 днів тому)
		const oldDate = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000);
		await fs.utimes(file, oldDate, oldDate);

		const cleanup = new Cleanup();
		const result = await cleanup.cleanup(tmpDir, 90, false); // confirm = false

		assert.equal(result.deleted, false);
		assert.equal(result.candidates.length, 1);

		// Файл повинен залишитися на диску
		const fileExists = await fs.stat(file);
		assert.ok(fileExists.isFile());
	});

	test('Confirm mode: видаляє файли старіші за вказаний період', async () => {
		const oldFile = path.join(tmpDir, 'old.txt');
		const newFile = path.join(tmpDir, 'new.txt');

		await fs.writeFile(oldFile, 'Old Data');
		await fs.writeFile(newFile, 'New Data');

		// oldFile — 100 днів тому
		const oldDate = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000);
		await fs.utimes(oldFile, oldDate, oldDate);

		const cleanup = new Cleanup();
		const result = await cleanup.cleanup(tmpDir, 90, true); // confirm = true

		assert.equal(result.deleted, true);
		assert.equal(result.deletedCount, 1);

		// oldFile має бути видалений, newFile повинен залишитися
		await assert.rejects(async () => await fs.stat(oldFile), { code: 'ENOENT' });
		const newFileExists = await fs.stat(newFile);
		assert.ok(newFileExists.isFile());
	});
});
