import { describe, expect, it } from 'vitest';
import { getTextDirection } from './direction';

// The locales Explorer ships, named like `availableLocales` in ./index.ts
const shippedLocales = Object.keys(import.meta.glob('./messages/*.json')).map((path) =>
	path
		.replace('./messages/', '')
		.replace(/\.json$/, '')
		.replaceAll('_', '-')
);

describe('getTextDirection', () => {
	it('is right to left for languages written in a right-to-left script', () => {
		for (const locale of ['ar', 'ar-SA', 'fa', 'ur', 'ps', 'ckb', 'he', 'iw', 'yi', 'dv']) {
			expect(getTextDirection(locale), locale).toBe('rtl');
		}
	});

	it('is left to right for other languages', () => {
		for (const locale of ['en', 'en-US', 'fr', 'ru', 'hi', 'zh-CN', 'kmr-TR']) {
			expect(getTextDirection(locale), locale).toBe('ltr');
		}
	});

	it('follows the script given in the locale', () => {
		expect(getTextDirection('sd-Deva')).toBe('ltr');
		expect(getTextDirection('az-Arab')).toBe('rtl');
	});

	it('falls back to left to right for missing or invalid locales', () => {
		for (const locale of [null, undefined, '', '*', 'fr-FR;q=0.9', 'not a locale']) {
			expect(getTextDirection(locale), String(locale)).toBe('ltr');
		}
	});

	it('marks these shipped locales as right to left', () => {
		const rtlLocales = shippedLocales.filter((locale) => getTextDirection(locale) === 'rtl');
		expect(rtlLocales.toSorted()).toEqual(['ar', 'fa', 'he', 'sd', 'ug', 'ur', 'yi']);
	});
});
