<script lang="ts">
  import { goto } from '$app/navigation';
  import type { PageData } from './types';
  import type { ComponentValueType } from '$app/DatabaseDefinitions';

  export let data: PageData;

  let query = data.searchParams.get('q') || '';
  let selectedType = data.searchParams.get('type') || '';
  let useValueRange = data.searchParams.get('range') === 'true';
  let minValue = data.searchParams.get('min') || '';
  let maxValue = data.searchParams.get('max') || '';
  let loading = false;

  $: selectedTypeData = data.types.find(t => t.id === selectedType);
  $: showValueInputs = useValueRange && selectedTypeData?.value_type;
  $: valueLabel = getValueLabel(selectedTypeData?.value_type as ComponentValueType);

  function getValueLabel(type: ComponentValueType | null): string {
    switch (type) {
      case 'resistance': return 'Resistance (e.g., 10k, 4.7M)';
      case 'capacitance': return 'Capacitance (e.g., 22n, 0.1u)';
      case 'switch': return 'Configuration (e.g., SPDT, 2P3T)';
      default: return '';
    }
  }

  async function handleSearch() {
    loading = true;
    const params = new URLSearchParams();

    if (useValueRange && selectedType) {
      params.set('range', 'true');
      params.set('type', selectedType);
      params.set('min', minValue);
      params.set('max', maxValue);
    } else if (query) {
      params.set('q', query);
      if (selectedType) params.set('type', selectedType);
    }

    await goto(`?${params.toString()}`);
    loading = false;
  }
</script>

<div class="max-w-4xl mx-auto space-y-6">
  <h1 class="text-2xl font-bold">Component Search</h1>

  <div class="space-y-4">
    <div class="flex gap-4">
      <div class="flex-1">
        <label for="component-type" class="block mb-1 text-sm">Component Type</label>
        <select
          id="component-type"
          bind:value={selectedType}
          class="w-full px-3 py-2 border rounded"
        >
          <option value="">All Types</option>
          {#each data.types as type}
            <option value={type.id}>{type.name}</option>
          {/each}
        </select>
      </div>

      {#if selectedTypeData?.value_type}
        <div class="flex items-end pb-2">
          <label class="flex items-center gap-2">
            <input
              type="checkbox"
              id="use-range"
              bind:checked={useValueRange}
              class="border-gray-300 rounded"
            />
            <span class="text-sm">Search by value range</span>
          </label>
        </div>
      {/if}
    </div>

    {#if showValueInputs}
      <div class="flex gap-4">
        <div class="flex-1">
          <label for="min-value" class="block mb-1 text-sm">Min {valueLabel}</label>
          <input
            type="text"
            id="min-value"
            bind:value={minValue}
            class="w-full px-3 py-2 border rounded"
            placeholder={valueLabel}
          />
        </div>
        <div class="flex-1">
          <label for="max-value" class="block mb-1 text-sm">Max {valueLabel}</label>
          <input
            type="text"
            id="max-value"
            bind:value={maxValue}
            class="w-full px-3 py-2 border rounded"
            placeholder={valueLabel}
          />
        </div>
      </div>
    {:else}
      <div>
        <label for="query" class="block mb-1 text-sm">Search Query</label>
        <input
          type="text"
          id="query"
          bind:value={query}
          placeholder="Search components..."
          class="w-full px-4 py-2 border rounded"
        />
      </div>
    {/if}

    <button
      type="button"
      on:click={handleSearch}
      disabled={loading}
      class="w-full py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-blue-400"
    >
      {loading ? 'Searching...' : 'Search'}
    </button>
  </div>

  {#if data.results.length > 0}
    <div class="grid gap-4">
      {#each data.results as component (component.id)}
        <div class="p-4 border rounded hover:bg-gray-50">
          <div class="flex justify-between">
            <div>
              <h3 class="font-medium">
                {component.component_type.name} - {component.family || 'N/A'}
              </h3>
              {#if component.display_value}
                <p class="text-sm">Value: {component.display_value}</p>
              {/if}
              <p class="text-sm text-gray-600">
                Manufacturer: {component.manufacturer || 'N/A'}
              </p>
            </div>
            <div class="text-right">
              <p class="font-medium">Qty: {component.quantity}</p>
              <p class="text-sm text-gray-600">
                Location: {component.location.name}
              </p>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {:else if data.searchParams.has('q') || data.searchParams.has('range')}
    <div class="py-8 text-center text-gray-600">
      <p>No components found matching your search criteria</p>
    </div>
  {/if}
</div>