# File Organizer CLI

Інструмент командного рядка (CLI) для аналізу, пошуку дублікатів, сортування та очищення файлів.

## Команди

1. **Сканування директорії:**

```bash
node file-organizer.js scan /path/to/directory
```

або через npm script

```bash
npm run scan -- /path/to/directory
```

2. **Пощук дубликатів (SHA-256)**:

```bash
node file-organizer.js duplicates /path/to/directory
```

або

```bash
npm run duplicates -- /path/to/directory
```

3. **Организація та сортування файлів**:

```bash
node file-organizer.js organize /source/directory --output /target/directory
```

або без флагу `--output`

```bash
npm run organize -- /source/directory /target/directory
```

4. **Очистка старих файлів**:

Попередній перегляд (Dry Run):

```bash
node file-organizer.js cleanup /path/to/directory --older-than 90
```

або без флагу `--older-than`

```bash
npm run cleanup -- /path/to/directory 90
```

5. **Видалення з підтвердженням**:

```bash
node file-organizer.js cleanup /path/to/directory --older-than 90 --confirm
```

### Наведені приклади роботи застосунку з каталогом `file-organizer/`:

1. Сканування

```text
 npm run  scan -- .\file-organizer\

> file-organizer@1.0.0 scan
> node file-organizer.js scan .\file-organizer\

📂 Scanning: C:\Education\GoIt\BackEnd_JavaScript\goit-backendjs-hw-01\file-organizer
Processing... ███████████████░░░░░ 37/37 files

📊 Scan Results:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total files: 37
Total size: 93.5 MB

By File Type:
  .pdf              6 files   41.7 MB
  .txt              5 files   112.6 KB
  .docx             3 files   12.5 MB
  .csv              3 files   20.4 MB
  .png              3 files   3.2 KB
  .zip              1 files   4.4 KB
  .xlsx             1 files   184.5 KB
  .xls              1 files   137.0 KB
  .cpp              1 files   0.2 KB
  .js               1 files   0.5 KB
  .py               1 files   0.2 KB
  .json             1 files   0.5 KB
  .jpg              1 files   0.6 KB
  (other)           9 files   18.5 MB

File Age:
  Last 7 days:   33 files
  Last 30 days:  33 files
  Older than 90: 4 files

Largest files:
  1  large-doc.pdf 36.8 MB
  2  5.mp3 18.3 MB
  3  4.docx 10.8 MB

Oldest file: 3.dat (modified 890 days ago)
```

2. Пощук дубликатів

```text
 npm run  duplicates -- .\file-organizer\

> file-organizer@1.0.0 duplicates
> node file-organizer.js duplicates .\file-organizer\

🔍 Searching for duplicates in: C:\Education\GoIt\BackEnd_JavaScript\goit-backendjs-hw-01\file-organizer
Calculating hashes... ████████████████████ 37/37 files

Found  8 duplicate groups (12.3 MB wasted):

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Group 1 (2 copies, 72.9 KB each):
SHA-256: 382ac9ea60bb0ba4...

  📄 C:\Education\GoIt\BackEnd_JavaScript\goit-backendjs-hw-01\file-organizer\simple.pdf
  📄 C:\Education\GoIt\BackEnd_JavaScript\goit-backendjs-hw-01\file-organizer\Dir1\Dir11\11.pdf

Wasted space: 72.9 KB

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Group 2 (3 copies, 0.2 KB each):
SHA-256: 03712e4619bb1815...

  📄 C:\Education\GoIt\BackEnd_JavaScript\goit-backendjs-hw-01\file-organizer\simple.txt
  📄 C:\Education\GoIt\BackEnd_JavaScript\goit-backendjs-hw-01\file-organizer\Dir3\3.txt
  📄 C:\Education\GoIt\BackEnd_JavaScript\goit-backendjs-hw-01\file-organizer\Dir3\Dir31\31.cpp

Wasted space: 0.4 KB

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Group 3 (2 copies, 10.2 MB each):
SHA-256: 840b5990b4fb6ad2...

  📄 C:\Education\GoIt\BackEnd_JavaScript\goit-backendjs-hw-01\file-organizer\Dir4\4.csv
  📄 C:\Education\GoIt\BackEnd_JavaScript\goit-backendjs-hw-01\file-organizer\Dir3\3.csv

Wasted space: 10.2 MB

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Group 4 (2 copies, 2.0 MB each):
SHA-256: 848c723aed15b989...

  📄 C:\Education\GoIt\BackEnd_JavaScript\goit-backendjs-hw-01\file-organizer\Dir4\4.pdf
  📄 C:\Education\GoIt\BackEnd_JavaScript\goit-backendjs-hw-01\file-organizer\Dir2\Dir22\22.pdf

Wasted space: 2.0 MB

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Group 5 (4 copies, 0.0 KB each):
SHA-256: e3b0c44298fc1c14...

  📄 C:\Education\GoIt\BackEnd_JavaScript\goit-backendjs-hw-01\file-organizer\Dir3\3.dat
  📄 C:\Education\GoIt\BackEnd_JavaScript\goit-backendjs-hw-01\file-organizer\Dir2\Dir22\22.dat
  📄 C:\Education\GoIt\BackEnd_JavaScript\goit-backendjs-hw-01\file-organizer\Dir2\Dir21\21.dat
  📄 C:\Education\GoIt\BackEnd_JavaScript\goit-backendjs-hw-01\file-organizer\Dir1\Dir11\11.dat

Wasted space: 0.0 KB

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Group 6 (2 copies, 0.5 KB each):
SHA-256: d4c252ff7d447c54...

  📄 C:\Education\GoIt\BackEnd_JavaScript\goit-backendjs-hw-01\file-organizer\Dir3\Dir31\31.js
  📄 C:\Education\GoIt\BackEnd_JavaScript\goit-backendjs-hw-01\file-organizer\Dir1\Dir11\11.txt

Wasted space: 0.5 KB

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Group 7 (2 copies, 0.2 KB each):
SHA-256: 1afd836f5880788d...

  📄 C:\Education\GoIt\BackEnd_JavaScript\goit-backendjs-hw-01\file-organizer\Dir3\Dir31\31.py
  📄 C:\Education\GoIt\BackEnd_JavaScript\goit-backendjs-hw-01\file-organizer\Dir2\Dir21\21.txt

Wasted space: 0.2 KB

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Group 8 (2 copies, 1.5 KB each):
SHA-256: ba3e7c9c8f7c4505...

  📄 C:\Education\GoIt\BackEnd_JavaScript\goit-backendjs-hw-01\file-organizer\Dir1\indexed-color-800x600.png
  📄 C:\Education\GoIt\BackEnd_JavaScript\goit-backendjs-hw-01\file-organizer\Dir1\Dir13\13.png

Wasted space: 1.5 KB

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💾 Total wasted space: 12.3 MB
```

3. Организація та сортування файлів:

```text
 npm run organize .\file-organizer\ OutputData

> file-organizer@1.0.0 organize
> node file-organizer.js organize .\file-organizer\ OutputData

📦 Organizing: C:\Education\GoIt\BackEnd_JavaScript\goit-backendjs-hw-01\file-organizer
Target: C:\Education\GoIt\BackEnd_JavaScript\goit-backendjs-hw-01\OutputData

Creating folders...
  ✓ Documents/
  ✓ Images/
  ✓ Archives/
  ✓ Code/
  ✓ Videos/
  ✓ Other/

Copying files...
Processing... ████████████████████ 37/37


Summary:
  Documents :19 files -> Organized/Documents/
  Images    :4 files -> Organized/Images/
  Archives  :1 files -> Organized/Archives/
  Code      :4 files -> Organized/Code/
  Videos    :0 files -> Organized/Videos/
  Other     :9 files -> Organized/Other/

Total copied: 37 files (93.5 MB)

# Повторний виклик команди повторно, щоб побачити дублювання назв файлів
npm run organize -- .\file-organizer\ OutputData

> file-organizer@1.0.0 organize
> node file-organizer.js organize .\file-organizer\ OutputData

📦 Organizing: C:\Education\GoIt\BackEnd_JavaScript\goit-backendjs-hw-01\file-organizer
Target: C:\Education\GoIt\BackEnd_JavaScript\goit-backendjs-hw-01\OutputData

Creating folders...
  ✓ Documents/
  ✓ Images/
  ✓ Archives/
  ✓ Code/
  ✓ Videos/
  ✓ Other/

Copying files...
Processing... ████████████████████ 37/37

✅ Organization complete!

Summary:
  Documents :19 files -> Organized/Documents/
  Images    :4 files -> Organized/Images/
  Archives  :1 files -> Organized/Archives/
  Code      :4 files -> Organized/Code/
  Videos    :0 files -> Organized/Videos/
  Other     :9 files -> Organized/Other/

Total copied: 37 files (93.5 MB)
```

### Наведені приклади роботи застосунку з каталогом `OutputData/`:

4. Попередній перегляд:

```text
 node file-organizer.js cleanup  OutputData --older-than 90
🧹 Cleanup: C:\Education\GoIt\BackEnd_JavaScript\goit-backendjs-hw-01\OutputData
Looking for files older than 90 days...

Found 43 files to delete:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 11(1).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 11(2).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 11(3).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 11(4).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 11(5).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 11(6).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 11.dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 21(1).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 21(2).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 21(3).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 21(4).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 21(5).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 21(6).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 21.dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 22(1).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 22(2).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 22(3).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 22(4).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 22(5).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 22(6).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 22.dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 3(1).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 3(2).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 3(3).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 3(4).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 3(5).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 3(6).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 3.dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 4(1).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 4(2).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 4.dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 13(2).png | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 11(2).pdf | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 11(2).txt | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 21(2).txt | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 22(2).pdf | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 3(2).csv | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 4(1).xlsx | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 4(2).pdf | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 4(2).xls | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 4(2).xlsx | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 4.xlsx | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total: 43 files (0.0 KB)
```

```text
node file-organizer.js cleanup  OutputData --older-than 90 --confirm
🧹 Cleanup: C:\Education\GoIt\BackEnd_JavaScript\goit-backendjs-hw-01\OutputData
Looking for files older than 90 days...

Found 43 files to delete:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 11(1).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 11(2).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 11(3).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 11(4).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 11(5).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 11(6).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 11.dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 21(1).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 21(2).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 21(3).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 21(4).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 21(5).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 21(6).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 21.dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 22(1).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 22(2).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 22(3).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 22(4).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 22(5).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 22(6).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 22.dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 3(1).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 3(2).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 3(3).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 3(4).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 3(5).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 3(6).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 3.dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 4(1).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 4(2).dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 4.dat | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 13(2).png | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 11(2).pdf | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 11(2).txt | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 21(2).txt | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 22(2).pdf | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 3(2).csv | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 4(1).xlsx | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 4(2).pdf | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 4(2).xls | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 4(2).xlsx | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
📄 4.xlsx | Size:0.0 KB | Modified: 891 days ago (2024-04-26)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DELETING 43 files (0 B). This action cannot be undone!

Deleting... ████████████████████ 43/43

✅ Cleanup complete! Deleted: 43 files (0 B freed)
```
