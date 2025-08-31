// scripts/validate-service-links.mjs
import fs from 'node:fs';
import path from 'node:path';
import glob from 'fast-glob';
import matter from 'gray-matter';

const ROOT = path.resolve(process.cwd(), 'src/content');

function readFrontmatter(file) {
	const raw = fs.readFileSync(file, 'utf8');
	return matter(raw).data || {};
}

function findServiceFile(key) {
	const patterns = [
		`services/**/${key}.md`,
		`services/**/${key}.mdx`,
	].map((p) => path.join(ROOT, p));
	const hits = glob.sync(patterns, { dot: false });
	return hits[0] || null;
}

let errors = [];
const workFiles = glob.sync(path.join(ROOT, 'work/**/*.{md,mdx}'));

for (const wf of workFiles) {
	const data = readFrontmatter(wf);
	const keys = Array.isArray(data.services) ? data.services : [];
	for (const key of keys) {
		const hit = findServiceFile(key);
		if (!hit) {
			errors.push(
				`[services] Missing sub-service file for key "${key}" referenced by ${path.relative(process.cwd(), wf)}`
			);
		}
	}
}

if (errors.length) {
	console.error(`\nFound ${errors.length} service-link issue(s):`);
	for (const e of errors) console.error(' - ' + e);
	process.exit(1);
} else {
	console.log('Service link validation OK ✔︎');
}
