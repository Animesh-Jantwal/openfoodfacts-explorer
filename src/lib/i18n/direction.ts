/** Writing direction of a language, as used by the HTML `dir` attribute. */
export type TextDirection = 'ltr' | 'rtl';

/** Scripts written right to left (ISO 15924 codes), among those used by living languages. */
const RTL_SCRIPTS = new Set([
	'Adlm',
	'Arab',
	'Aran',
	'Hebr',
	'Mand',
	'Mend',
	'Nkoo',
	'Rohg',
	'Samr',
	'Syrc',
	'Thaa',
	'Yezi'
]);

/**
 * Returns the writing direction of a locale such as `ar`, `he-IL` or `sd-Deva`.
 *
 * The direction follows the script: the one in the locale when it has one, otherwise the
 * script the language is usually written in (CLDR likely subtags). New locales therefore get
 * the right direction without a list of languages to maintain.
 */
export function getTextDirection(locale: string | null | undefined): TextDirection {
	if (!locale) return 'ltr';
	try {
		const { script } = new Intl.Locale(locale).maximize();
		return script !== undefined && RTL_SCRIPTS.has(script) ? 'rtl' : 'ltr';
	} catch {
		// Not a valid language tag
		return 'ltr';
	}
}
