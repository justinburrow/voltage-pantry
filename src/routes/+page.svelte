<script lang="ts">
  import { supabase } from '$lib/db/supabase';

  let searchQuery = '';
  let searchResults: any[] = [];
  let loading = false;

  async function handleSearch() {
    if (!searchQuery.trim()) return;

    loading = true;
    try {
      const { data, error } = await supabase
        .rpc('search_components_fuzzy', {
          search_query: searchQuery,
          similarity_threshold: 0.3
        });

      if (error) throw error;
      searchResults = data || [];
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      loading = false;
    }
  }
</script>

<div class="space-y-6">
  <div class="max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Electronic Component Search</h1>

    <div class="flex gap-2">
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Search components..."
        class="flex-1 px-4 py-2 border rounded-md"
        on:keydown={(e) => e.key === 'Enter' && handleSearch()}
      />
      <button
        on:click={handleSearch}
        disabled={loading}
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
      >
        {loading ? 'Searching...' : 'Search'}
      </button>
    </div>
  </div>

  {#if searchResults.length > 0}
    <div class="max-w-4xl mx-auto">
      <h2 class="text-xl font-semibold mb-4">Results</h2>
      <div class="grid gap-4">
        {#each searchResults as component}
          <div class="p-4 border rounded-md hover:bg-gray-50">
            <div class="flex justify-between">
              <div>
                <h3 class="font-medium">{component.type} - {component.family}</h3>
                <p class="text-sm text-gray-600">
                  Manufacturer: {component.manufacturer || 'N/A'}
                </p>
                {#if component.resistor_specs?.[0]}
                  <p class="text-sm">
                    {component.resistor_specs[0].resistance}Ω
                    {component.resistor_specs[0].wattage}W
                    ±{component.resistor_specs[0].tolerance}%
                  </p>
                {/if}
              </div>
              <div class="text-right">
                <p class="font-medium">Qty: {component.quantity}</p>
                <p class="text-sm text-gray-600">Location: {component.location || 'N/A'}</p>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>