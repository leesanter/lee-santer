import fs from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import matter from 'gray-matter';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'public/og');

async function loadFont(name, weight, file) {
	try {
		const data = await fs.readFile(path.join(ROOT, 'src/assets/fonts', file));
		return { name, data, weight, style: 'normal' };
	} catch {
		return null;
	}
}

const fonts = (await Promise.all([
	loadFont('Inter', 400, 'Inter-Regular.ttf'),
	loadFont('Inter', 700, 'Inter-Bold.ttf'),
])).filter(Boolean);

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
