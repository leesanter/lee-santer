// scripts/validate-service-links.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import matter from 'gray-matter';

const ROOT = process.cwd();
const SVC_GLOB = 'src/content/services/**/*.{md,mdx}';
const WORK_GLOB = 'src/content/work/**/*.{md,mdx}';

const svcByKey = new Map();              // key -> { category, anchor, file }
const anchorsPerCat = new Map();         // category -> Set(anchor)
const errors = [];

/** Load services (exclude kind: category) */
const svcFiles = await fg(SVC_GLOB, { cwd: ROOT });
for (const file of svcFiles) {
	const full = path.join(ROOT, file);
	const src = await fs.readFile(full, 'utf8');
	const fm = matter(src).data || {};
	if (fm.kind === 'category') continue;

	const key = path.basename(file).replace(/\.(md|mdx)$/i, '');
	const category = String(fm.category || '').trim();
	const anchor = String(fm.anchor || key).trim();

	// record
	svcByKey.set(key, { category, anchor, file });

	// check duplicate anchors within a category
	if (category) {
		const set = anchorsPerCat.get(category) ?? new Set();
		if (set.has(anchor)) {
			errors.push(`Duplicate anchor "#${anchor}" in category "${category}" (${file})`);
		}
		set.add(anchor);
		anchorsPerCat.set(category, set);
	}
}

/** Validate work -> services references */
const workFiles = await fg(WORK_GLOB, { cwd: ROOT });
for (const file of workFiles) {
	const full = path.join(ROOT, file);
	const src = await fs.readFile(full, 'utf8');
	const fm = matter(src).data || {};
	const keys = Array.isArray(fm.services) ? fm.services : [];

	for (const key of keys) {
		if (!svcByKey.has(key)) {
			errors.push(`Work "${file}" references unknown service key "${key}"`);
		}
	}
}

if (errors.length) {
	console.error('\n❌ Service link validation failed:\n');
	for (const e of errors) console.error(' -', e);
	process.exit(1);
} else {
	console.log('✅ Service link validation passed.');
}
