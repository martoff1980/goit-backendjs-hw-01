import { EventEmitter } from 'events';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { pipeline } from 'stream/promises';

export const CATEGORIES = {
	Documents: ['.pdf', '.docx', '.doc', '.txt', '.md', '.xlsx', '.xls', '.csv', '.pptx'],
	Images: ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp'],
	Archives: ['.zip', '.rar', '.tar', '.gz', '.7z'],
	Code: ['.js', '.py', '.java', '.cpp', '.html', '.css', '.json'],
	Videos: ['.mp4', '.avi', '.mkv', '.mov', '.webm'],
	Other: [],
};

const LARGE_FILE_THRESHOLD = 10 * 1024 * 1024; // 10 MB

export class Organizer extends EventEmitter {
	getCategory(extension) {
		if (!extension) return 'Other';

		const ext = extension.toLowerCase();
		for (const [cat, extensions] of Object.entries(CATEGORIES)) {
			if (extensions.includes(ext)) {
				return cat;
			}
		}
		return 'Other';
	}

	async organize(sourceDir, targetDir) {
		const absSource = path.resolve(sourceDir);
		const absTarget = path.resolve(targetDir);

		this.emit('organize-start', { source: absSource, target: absTarget });

		let files = [];
		try {
			const entries = await fsPromises.readdir(absSource, { recursive: true });
			for (const entry of entries) {
				const fullPath = path.join(absSource, entry);
				try {
					const stats = await fsPromises.stat(fullPath);
					if (stats.isFile()) {
						files.push({ fullPath, stats });
					}
				} catch (e) {}
			}
		} catch (error) {
			this.handleError(error, absSource);
			return;
		}

		// Створення цільових папок для категорій
		// перевірка наявності папок і створення їх, якщо вони відсутні
		try {
			for (const cat of Object.keys(CATEGORIES)) {
				await fsPromises.mkdir(path.join(absTarget, cat), { recursive: true });
			}
		} catch (error) {
			this.handleError(error, absTarget);
			return;
		}

		const summary = {
			byCategory: {},
			totalCopied: 0,
			totalSize: 0,
		};
		Object.keys(CATEGORIES).forEach((c) => (summary.byCategory[c] = 0));

		let processed = 0;

		for (const file of files) {
			const ext = path.extname(file.fullPath);
			const cat = this.getCategory(ext);
			const fileName = path.basename(file.fullPath);
			const targetFolder = path.join(absTarget, cat);

			const uniqueTarget = await this.getUniqueFilePath(targetFolder, fileName);

			this.emit('copy-start', { file: fileName, cat });

			try {
				if (file.stats.size >= LARGE_FILE_THRESHOLD) {
					await pipeline(fs.createReadStream(file.fullPath), fs.createWriteStream(uniqueTarget));
				} else {
					await fsPromises.copyFile(file.fullPath, uniqueTarget);
				}

				summary.byCategory[cat]++;
				summary.totalCopied++;
				summary.totalSize += file.stats.size;

				processed++;
				this.emit('copy-complete', { current: processed, total: files.length });
			} catch (err) {
				this.emit('copy-error', { file: fileName, error: err.message });
			}
		}

		this.emit('organize-complete', summary);
		return summary;
	}

	async getUniqueFilePath(folderPath, fileName) {
		let targetPath = path.join(folderPath, fileName);
		try {
			await fsPromises.access(targetPath);
		} catch {
			// Файлу немає
			return targetPath;
		}

		const ext = path.extname(fileName);
		const base = path.basename(fileName, ext);
		let counter = 1;

		while (true) {
			try {
				// Перевірка наявності файлу з новим ім'ям
				await fsPromises.access(targetPath);
				// Якщо файл існує, формуємо нове ім'я з лічильником
				targetPath = path.join(folderPath, `${base}(${counter})${ext}`);
				counter++;
			} catch {
				return targetPath;
			}
		}
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
