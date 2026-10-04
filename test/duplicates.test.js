import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { DuplicateFinder } from '../lib/duplicates.js';

describe('DuplicateFinder Module', () => {
	let tmpDir;

	beforeEach(async () => {
		tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-duplicates-'));
	});

	afterEach(async () => {
		await fs.rm(tmpDir, { recursive: true, force: true });
	});

	test('знаходить дублікати файлів з однаковим вмістом', async () => {
		const content = 'This is unique contents for testing hashing';

		const file1 = path.join(tmpDir, 'file1.txt');
		const file2 = path.join(tmpDir, 'file2_copy.txt');
		const file3 = path.join(tmpDir, 'different.txt');

		await fs.writeFile(file1, content);
		await fs.writeFile(file2, content);
		await fs.writeFile(file3, 'Different content completely');

		const finder = new DuplicateFinder();
		const result = await finder.findDuplicates(tmpDir);

		assert.equal(result.duplicateGroups.length, 1);
		assert.equal(result.duplicateGroups[0].paths.length, 2);
		assert.equal(result.totalWastedSpace, Buffer.byteLength(content));
	});

	test('повертає порожній результат, якщо дублікатів немає', async () => {
		await fs.writeFile(path.join(tmpDir, 'a.txt'), 'Content A');
		await fs.writeFile(path.join(tmpDir, 'b.txt'), 'Content B');

		const finder = new DuplicateFinder();
		const result = await finder.findDuplicates(tmpDir);

		assert.equal(result.duplicateGroups.length, 0);
		assert.equal(result.totalWastedSpace, 0);
	});
});
