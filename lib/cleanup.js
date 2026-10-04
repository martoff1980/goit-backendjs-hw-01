import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';

export class Cleanup extends EventEmitter {
	async cleanup(directory, daysThreshold, isConfirm = false) {
		const absPath = path.resolve(directory);
		this.emit('cleanup-start', { directory: absPath, days: daysThreshold });

		let files = [];
		try {
			const entries = await fs.readdir(absPath, { recursive: true });
			for (const entry of entries) {
				const fullPath = path.join(absPath, entry);
				try {
					const stats = await fs.stat(fullPath);
					if (stats.isFile()) {
						files.push({ fullPath, stats });
					}
				} catch (e) {}
			}
		} catch (error) {
			this.handleError(error, absPath);
			return;
		}

		const now = Date.now();
		const msThreshold = daysThreshold * 24 * 60 * 60 * 1000;
		const candidates = [];

		for (const file of files) {
			const ageMs = now - file.stats.mtime.getTime();
			const daysOld = Math.floor(ageMs / (1000 * 60 * 60 * 24));
			if (ageMs > msThreshold) {
				const item = {
					path: file.fullPath,
					size: file.stats.size,
					mtime: file.stats.mtime,
					daysOld,
				};
				candidates.push(item);
				this.emit('file-found', item);
			}
		}

		const totalSize = candidates.reduce((acc, curr) => acc + curr.size, 0);

		if (!isConfirm) {
			this.emit('dry-run-complete', { candidates, totalSize });
			return { candidates, totalSize, deleted: false };
		}

		this.emit('cleanup-start-deleting', { candidates, totalSize });

		let deletedCount = 0;
		let deletedSize = 0;

		for (let i = 0; i < candidates.length; i++) {
			const candidate = candidates[i];
			try {
				await fs.unlink(candidate.path);
				deletedCount++;
				deletedSize += candidate.size;
				this.emit('file-deleted', {
					candidate,
					current: i + 1,
					total: candidates.length,
				});
			} catch (err) {
				console.error(`❌ Failed to delete ${candidate.path}:${err.message}`);
			}
		}

		const result = { deletedCount, deletedSize, deleted: true };
		this.emit('cleanup-complete', result);
		return result;
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
