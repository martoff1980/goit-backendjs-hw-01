import { EventEmitter } from 'events';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export class DuplicateFinder extends EventEmitter {
	async findDuplicates(directory) {
		const absPath = path.resolve(directory);
		this.emit('search-start', { directory: absPath });

		let files = [];
		try {
			const entries = await fsPromises.readdir(absPath, { recursive: true });
			for (const entry of entries) {
				const fullPath = path.join(absPath, entry);
				try {
					const stats = await fsPromises.stat(fullPath);
					if (stats.isFile()) {
						files.push({ path: fullPath, size: stats.size });
					}
				} catch (e) {
					// Игнорируем
				}
			}
		} catch (error) {
			this.handleError(error, absPath);
			return;
		}

		const hashMap = new Map();
		let processed = 0;

		for (const file of files) {
			try {
				const hash = await this.calculateHash(file.path);
				if (!hashMap.has(hash)) {
					hashMap.set(hash, { paths: [], size: file.size });
				}
				hashMap.get(hash).paths.push(file.path);
			} catch (err) {
				this.emit('file-error', { path: file.path, error: err.message });
			}
			processed++;
			this.emit('file-processed', { current: processed, total: files.length });
		}

		const duplicateGroups = [];
		let totalWastedSpace = 0;

		for (const [hash, group] of hashMap.entries()) {
			if (group.paths.length > 1) {
				const wastedSpace = group.size * (group.paths.length - 1);
				totalWastedSpace += wastedSpace;
				duplicateGroups.push({
					hash,
					size: group.size,
					paths: group.paths,
					wastedSpace,
				});
			}
		}

		const result = { duplicateGroups, totalWastedSpace };
		this.emit('duplicates-found', result);
		return result;
	}

	calculateHash(filePath) {
		return new Promise((resolve, reject) => {
			const hash = crypto.createHash('sha256');
			const stream = fs.createReadStream(filePath);

			stream.on('data', (chunk) => hash.update(chunk));
			stream.on('end', () => resolve(hash.digest('hex')));
			stream.on('error', reject);
		});
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
