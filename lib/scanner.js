import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';
import { CATEGORIES } from './organizer.js';

export class Scanner extends EventEmitter {
	async scan(directory) {
		const absPath = path.resolve(directory);
		this.emit('scan-start', { directory: absPath });

		let files = [];
		try {
			files = await fs.readdir(absPath, { recursive: true });
		} catch (error) {
			this.handleError(error, absPath);
			return;
		}

		const statsList = [];
		let processedCount = 0;

		for (const relativePath of files) {
			const fullPath = path.join(absPath, relativePath);
			try {
				const stats = await fs.stat(fullPath);
				if (stats.isFile()) {
					const fileData = {
						path: fullPath,
						relativePath,
						size: stats.size,
						mtime: stats.mtime,
					};
					statsList.push(fileData);
					processedCount++;
					this.emit('file-found', { fileData, current: processedCount, total: files.length });
				}
			} catch (err) {
				// Игнорування помилки доступу до окремим файлам
			}
		}

		const summary = this.computeStatistics(statsList);
		this.emit('scan-complete', summary);
		return summary;
	}

	computeStatistics(files) {
		let totalSize = 0;
		let otherSize = 0;
		const byType = new Map();
		const rawTypesMap = new Map();
		const now = Date.now();
		let last7Days = 0;
		let last30Days = 0;
		let olderThan90 = 0;
		let otherCount = 0;

		let oldestFile = null;

		for (const file of files) {
			totalSize += file.size;

			// За типами
			const ext = path.extname(file.path).toLowerCase() || '(no extension)';
			if (!byType.has(ext)) {
				byType.set(ext, { count: 0, totalSize: 0 });
			}
			const typeStat = byType.get(ext);
			typeStat.count++;
			typeStat.totalSize += file.size;

			// За віком
			const ageInDays = (now - file.mtime.getTime()) / (1000 * 60 * 60 * 24);
			if (ageInDays <= 7) last7Days++;
			if (ageInDays <= 30) last30Days++;
			if (ageInDays > 90) olderThan90++;

			// Найстаріший файл
			if (!oldestFile || file.mtime < oldestFile.mtime) {
				oldestFile = file;
			}
		}

		// Сортування за кількістю файлів у кожному типі
		const sortedTypes = [...byType.entries()].sort((a, b) => b[1].count - a[1].count);
		// Створення списку всіх типів, які входять до категорій
		const certainedTypes = Object.values(CATEGORIES).flat();

		sortedTypes.forEach(([ext, info]) => {
			if (certainedTypes.includes(ext) && ext !== '(no extension)') {
				rawTypesMap.set(ext, info);
			} else {
				otherCount += info.count;
				otherSize += info.totalSize;
			}
		});

		if (otherCount > 0) {
			rawTypesMap.set('(other)', { count: otherCount, totalSize: otherSize });
		}

		// Топ-3 найбільших
		const sortedBySize = [...files].sort((a, b) => b.size - a.size);
		const largestFiles = sortedBySize.slice(0, 3);

		return {
			totalFiles: files.length,
			totalSize,
			byType: rawTypesMap,
			age: { last7Days, last30Days, olderThan90 },
			largestFiles,
			oldestFile,
		};
	}

	handleError(error, targetPath) {
		if (error.code === 'ENOENT') {
			console.error(`❌ Error: Directory not found: ${targetPath}`);
		} else if (error.code === 'EACCES') {
			console.error(`❌ Error: Permission denied: ${targetPath}`);
		} else {
			console.error(`❌ Unexpected error: ${error.message}`);
		}
		process.exit(1);
	}
}
