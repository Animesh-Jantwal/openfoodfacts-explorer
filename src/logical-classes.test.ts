import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/*
 * Right-to-left languages (Arabic, Hebrew, Persian, Urdu...) mirror the layout. That only works
 * when spacing, positions, borders and alignment use the start/end utilities, which follow the
 * writing direction, instead of the left/right ones. See "Right-to-left languages" in
 * docs/DESIGN.md.
 */

const SPACING = String.raw`(?:\d+(?:\.\d+)?|px|auto|full|\d+\/\d+|\[[^\]\s]+\])`;
const BORDER = String.raw`(?:\d+|\[[^\]\s]+\]|[a-z]+(?:-[a-z0-9]+)*(?:\/\d+)?)`;
const RADIUS = String.raw`(?:none|xs|sm|md|lg|xl|2xl|3xl|4xl|full|\[[^\]\s]+\])`;
const UTILITY = [
	String.raw`(?:scroll-)?[mp][lr]-${SPACING}`,
	String.raw`(?:left|right)-${SPACING}`,
	String.raw`(?:text|float|clear)-(?:left|right)`,
	String.raw`border-[lr](?:-${BORDER})?`,
	String.raw`rounded-(?:[tb][lr]|[lr])(?:-${RADIUS})?`
].join('|');
// Variants such as `md:`, `hover:`, `group-hover/item:`, `has-[:checked]:` or `[&>svg]:`
const VARIANTS = String.raw`(?:[\w@*-]+(?:\[[^\]\s]*\])?(?:\/[\w-]+)?:|\[[^\]\s]+\]:)*`;
// A whole class token, alone between delimiters, so that words like "left" are not matched
const PHYSICAL_CLASS = new RegExp(
	String.raw`(?<=^|[\s"'\`{(,])(${VARIANTS}!?-?)(${UTILITY})(!?)(?=$|[\s"'\`}),=])`,
	'gm'
);
// Left/right properties in <style> blocks; `left:` and `right:` positions stay allowed
// for elements placed from pointer or element coordinates.
const PHYSICAL_PROPERTY =
	/\b(?:(?:margin|padding|border)-(?:left|right)|text-align\s*:\s*(?:left|right)|float\s*:\s*(?:left|right))\b/g;

const LOGICAL: [RegExp, string][] = [
	[/^(scroll-)?ml-/, '$1ms-'],
	[/^(scroll-)?mr-/, '$1me-'],
	[/^(scroll-)?pl-/, '$1ps-'],
	[/^(scroll-)?pr-/, '$1pe-'],
	[/^left-/, 'inset-s-'],
	[/^right-/, 'inset-e-'],
	[/^(text|float|clear)-left$/, '$1-start'],
	[/^(text|float|clear)-right$/, '$1-end'],
	[/^border-l(?=-|$)/, 'border-s'],
	[/^border-r(?=-|$)/, 'border-e'],
	[/^rounded-tl(?=-|$)/, 'rounded-ss'],
	[/^rounded-tr(?=-|$)/, 'rounded-se'],
	[/^rounded-bl(?=-|$)/, 'rounded-es'],
	[/^rounded-br(?=-|$)/, 'rounded-ee'],
	[/^rounded-l(?=-|$)/, 'rounded-s'],
	[/^rounded-r(?=-|$)/, 'rounded-e']
];

const toLogical = (utility: string) =>
	LOGICAL.reduce((result, [pattern, replacement]) => result.replace(pattern, replacement), utility);

type Finding = { line: number; found: string; suggestion: string };

function findPhysicalClasses(source: string): Finding[] {
	return [...source.matchAll(PHYSICAL_CLASS)].map((match) => {
		const [found, prefix, utility, important] = match;
		return {
			line: source.slice(0, match.index).split('\n').length,
			found,
			suggestion: prefix + toLogical(utility) + important
		};
	});
}

function findPhysicalProperties(source: string): Finding[] {
	return [...source.matchAll(PHYSICAL_PROPERTY)].map((match) => ({
		line: source.slice(0, match.index).split('\n').length,
		found: match[0],
		suggestion: 'the logical property, such as margin-inline-start or text-align: start'
	}));
}

const srcDir = fileURLToPath(new URL('.', import.meta.url));
const sourceFiles = (readdirSync(srcDir, { recursive: true }) as string[]).filter(
	(file) =>
		/\.(svelte|ts|css)$/.test(file) &&
		!/\.(test|d)\.ts$/.test(file) &&
		!file.includes(join('i18n', 'messages'))
);

describe('left/right styles', () => {
	it('are written with start/end utilities, so right-to-left languages work', () => {
		const offenders = sourceFiles.flatMap((file) => {
			const source = readFileSync(join(srcDir, file), 'utf8');
			return [...findPhysicalClasses(source), ...findPhysicalProperties(source)].map(
				({ line, found, suggestion }) => `src/${file}:${line}: ${found} → ${suggestion}`
			);
		});
		expect(offenders).toEqual([]);
	});

	it('are recognised in all their forms', () => {
		const source =
			'<div class="ml-2 md:pl-4 -left-1 hover:text-right border-l-0 rounded-tr-lg group-hover/x:mr-auto">';
		expect(findPhysicalClasses(source).map(({ found, suggestion }) => [found, suggestion])).toEqual(
			[
				['ml-2', 'ms-2'],
				['md:pl-4', 'md:ps-4'],
				['-left-1', '-inset-s-1'],
				['hover:text-right', 'hover:text-end'],
				['border-l-0', 'border-s-0'],
				['rounded-tr-lg', 'rounded-se-lg'],
				['group-hover/x:mr-auto', 'group-hover/x:me-auto']
			]
		);
		expect(findPhysicalProperties('ol { padding-left: 1em; text-align: right; }')).toHaveLength(2);
	});

	it('ignore words and positions that are not utilities', () => {
		const source = `// Rotate left, then right
			const style = 'left: 10px; right: auto;';
			const languages = ['ml', 'pl', 'pr'];
			label = "Exclude (-) button on left";`;
		expect(findPhysicalClasses(source)).toEqual([]);
		expect(findPhysicalProperties(source)).toEqual([]);
	});
});
