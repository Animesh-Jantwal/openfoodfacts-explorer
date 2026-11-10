<script lang="ts">
	import { _ } from '#lib/i18n/index.js';
	import type { Facet } from '#lib/api/search.js';
	import type { FacetsSelection } from '#lib/search/facet-selection.js';
	import SearchFilters from './SearchFilters.svelte';
	import IconMdiFilterVariant from '@iconify-svelte/mdi/filter-variant';
	import IconMdiChevronRight from '@iconify-svelte/mdi/chevron-right';

	type Props = {
		facets?: Record<string, Facet>;
		selectedFacets?: FacetsSelection;
		totalActiveFilters?: number;
		hidden?: boolean;
		onToggleInclude?: (facetKey: string, itemKey: string) => void;
		onToggleExclude?: (facetKey: string, itemKey: string) => void;
		onAddInclude?: (facetKey: string, value: string) => void;
		onAddExclude?: (facetKey: string, value: string) => void;
		onRemoveInclude?: (facetKey: string, value: string) => void;
		onRemoveExclude?: (facetKey: string, value: string) => void;
	};

	let {
		facets = {},
		selectedFacets = {},
		totalActiveFilters = 0,
		hidden = $bindable(false),
		onToggleInclude = () => {},
		onToggleExclude = () => {},
		onAddInclude = () => {},
		onAddExclude = () => {},
		onRemoveInclude = () => {},
		onRemoveExclude = () => {}
	}: Props = $props();
</script>

<div class={['hidden h-full lg:block', hidden ? 'lg:hidden' : '']}>
	<aside class="sticky top-24 flex max-h-[calc(100vh-140px)] w-50 flex-col pe-2 xl:w-60">
		<div class="mb-3 flex shrink-0 items-center justify-between px-1">
			<div class="flex items-center gap-1.5">
				<IconMdiFilterVariant class="h-4 w-4 text-base-content/70" />
				<span class="text-xs font-bold tracking-wider text-base-content/70 uppercase">
					{$_('search.filters_title', { default: 'Filters' })}
				</span>
				{#if totalActiveFilters > 0}
					<span class="badge badge-xs font-semibold badge-primary">{totalActiveFilters}</span>
				{/if}
			</div>
			<button
				type="button"
				onclick={() => (hidden = true)}
				class="cursor-pointer text-xs font-medium text-primary/70 underline transition-colors select-none hover:text-primary"
			>
				{$_('search.hide_sidebar', { default: 'Hide' })}
			</button>
		</div>

		<nav
			aria-label={$_('search.filters_sidebar_title', { default: 'Search filters' })}
			class="relative flex flex-1 [scrollbar-width:none] flex-col gap-1 overflow-y-auto border-s-2 border-base-300 ps-3 text-sm [&::-webkit-scrollbar]:hidden"
		>
			<SearchFilters
				{facets}
				{selectedFacets}
				{onToggleInclude}
				{onToggleExclude}
				{onAddInclude}
				{onAddExclude}
				{onRemoveInclude}
				{onRemoveExclude}
			/>
		</nav>
	</aside>
</div>

{#if hidden}
	<button
		type="button"
		onclick={() => (hidden = false)}
		class="group fixed inset-s-0 top-1/2 z-50 hidden h-24 w-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded-e-xl border border-s-0 border-base-300 bg-base-200 text-base-content/70 shadow-md transition-all duration-300 outline-none hover:w-7 hover:border-primary hover:bg-primary hover:text-primary-content focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:flex"
		title={$_('search.filters_title', { default: 'Filters' })}
		aria-label={$_('search.filters_title', { default: 'Filters' })}
	>
		<IconMdiChevronRight
			aria-hidden="true"
			class="h-4 w-4 transition-transform duration-200 group-hover:scale-125 rtl:rotate-180"
		/>
	</button>
{/if}
