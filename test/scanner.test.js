import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { Scanner } from '../lib/scanner.js';

describe('Scanner Module', () => {
	let tmpDir;

	beforeEach(async () => {
		tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-scanner-'));
	});

	afterEach(async () => {
		await fs.rm(tmpDir, { recursive: true, force: true });
	});

	test('сканує директорію та вірно обраховує статистику', async () => {
		// Створення тестових файлів
		await fs.writeFile(path.join(tmpDir, 'doc1.pdf'), 'Hello PDF World');
		await fs.writeFile(path.join(tmpDir, 'img1.png'), 'PNG Image Data');

		const subDir = path.join(tmpDir, 'subdir');
		await fs.mkdir(subDir);
		await fs.writeFile(path.join(subDir, 'doc2.pdf'), 'Another PDF');

		const scanner = new Scanner();
		let fileFoundEmitted = 0;

		scanner.on('file-found', () => {
			fileFoundEmitted++;
		});

		const summary = await scanner.scan(tmpDir);

		assert.equal(summary.totalFiles, 3);
		assert.equal(fileFoundEmitted, 3);

		// Перевірка групування за типом
		assert.ok(summary.byType.has('.pdf'));
		assert.equal(summary.byType.get('.pdf').count, 2);
		assert.ok(summary.byType.has('.png'));
		assert.equal(summary.byType.get('.png').count, 1);
	});

	test('коректно визначає найкрупніший та найстаріший файл', async () => {
		const smallFile = path.join(tmpDir, 'small.txt');
		const largeFile = path.join(tmpDir, 'large.txt');

		await fs.writeFile(smallFile, 'a');
		await fs.writeFile(largeFile, 'a'.repeat(100));

		// Змінення дати модифікації для smallFile на 10 днів назад
		const pastDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
		await fs.utimes(smallFile, pastDate, pastDate);

		const scanner = new Scanner();
		const summary = await scanner.scan(tmpDir);

		assert.equal(summary.largestFiles[0].relativePath, 'large.txt');
		assert.equal(summary.oldestFile.relativePath, 'small.txt');
	});

	test('емітація події file-error при помилці доступу до файлу', async () => {
		const filePath = path.join(tmpDir, 'unreadable.txt');
		await fs.writeFile(filePath, 'Data');

		const scanner = new Scanner();
		let errorEmitted = false;

		scanner.on('file-error', (data) => {
			errorEmitted = true;
			assert.ok(data.path.includes('unreadable.txt'));
		});

		// Підміняємо fs.stat, щоб він симулював помилку доступу (EACCES) для даного файлу
		const originalStat = fs.stat;
		fs.stat = async (p) => {
			if (p === filePath) {
				const err = new Error('Permission denied');
				err.code = 'EACCES';
				throw err;
			}
			return originalStat(p);
		};

		try {
			await scanner.scan(tmpDir);
			assert.ok(errorEmitted, 'Подія file-error повинна бути викликана');
		} finally {
			// Обов'язкове відновлення оригінального методу у блоці finally
			fs.stat = originalStat;
		}
	});
});
