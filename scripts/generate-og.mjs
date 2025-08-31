// scripts/generate-og.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import matter from 'gray-matter';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'public/og');

async function readIfExists(p) {
	try {
		return await fs.readFile(p);
	} catch {
		return null;
	}
}

async function loadFontByCandidates(name, weight, candidates) {
	for (const p of candidates) {
		const data = await readIfExists(p);
		if (data) {
			if (process.env.CI || process.env.DEBUG_OG) {
				console.log(`[og] Using font: ${name} ${weight} → ${p}`);
			}
			return { name, data, weight, style: 'normal' };
		}
	}
	return null;
}

const REGULAR_CANDIDATES = [
	path.join(ROOT, 'src/assets/fonts/Inter-Regular.ttf'),
	// If you install @fontsource/inter:
	path.join(ROOT, 'node_modules', '@fontsource', 'inter', 'files', 'inter-latin-400-normal.ttf'),
	// GitHub Actions (Ubuntu) system font:
	'/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
];

const BOLD_CANDIDATES = [
	path.join(ROOT, 'src/assets/fonts/Inter-Bold.ttf'),
	path.join(ROOT, 'node_modules', '@fontsource', 'inter', 'files', 'inter-latin-700-normal.ttf'),
	'/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
];

const fonts = (await Promise.all([
	loadFontByCandidates('Inter', 400, REGULAR_CANDIDATES),
	loadFontByCandidates('Inter', 700, BOLD_CANDIDATES),
])).filter(Boolean);

if (fonts.length === 0) {
	throw new Error(
		[
			'No fonts are loaded. Satori requires at least one font.',
			'Fix one of the following:',
			'  • Add TTFs to src/assets/fonts (Inter-Regular.ttf, Inter-Bold.ttf), or',
			'  • npm i @fontsource/inter (script auto-detects), or',
			'  • Ensure DejaVu fonts exist on the system (CI usually has them).',
		].join('\n')
	);
}

function card({ title, label = 'Case Study' }) {
	return {
		type: 'div',
		props: {
			style: {
				width: '1200px',
				height: '630px',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				padding: '64px',
				background: '#0D0D0D',
				color: '#FFFFFF',
			},
			children: [
				{ type: 'div', props: { style: { fontSize: '28px', opacity: 0.75 }, children: label } },
				{ type: 'div', props: { style: { fontSize: '72px', fontWeight: 700, lineHeight: 1.1 }, children: title } },
				{ type: 'div', props: { style: { fontSize: '24px', opacity: 0.6 }, children: 'leesanter.com' } },
			],
		},
	};
}

async function renderPNG(tree) {
	const svg = await satori(tree, {
		width: 1200,
		height: 630,
		fonts,
	});
	const resvg = new Resvg(svg);
	return resvg.render().asPng();
}

async function ensureDir(dir) {
	await fs.mkdir(dir, { recursive: true });
}

async function genFor(glob, label, subdir) {
	const files = await fg(glob, { cwd: ROOT });
	await ensureDir(path.join(OUT, subdir));

	for (const file of files) {
		const slug = file
			.replace(/^src\/content\/[^/]+\//, '')
			.replace(/\.(md|mdx)$/i, '')
			.replace(/\/index$/, '');
		const full = path.join(ROOT, file);
		const fm = matter(await fs.readFile(full, 'utf8')).data || {};
		const title = String(fm.title || slug);

		const png = await renderPNG(card({ title, label }));
		const out = path.join(OUT, subdir, `${slug}.png`);
		await ensureDir(path.dirname(out));
		await fs.writeFile(out, png);
		console.log('OG →', path.relative(ROOT, out));
	}
}

await genFor('src/content/work/**/*.{md,mdx}', 'Case Study', 'work');
await genFor('src/content/insights/**/*.{md,mdx}', 'Insight', 'insights');

console.log('✅ OG images generated.');
