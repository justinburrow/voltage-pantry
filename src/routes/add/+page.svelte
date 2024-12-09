<script lang="ts">
  import { onMount } from 'svelte';
  import type { Database } from '$app/DatabaseDefinitions';

  export let data;
  let locations: Database['public']['Tables']['locations']['Row'][] = [];
  let supabase = data.supabase;

  let type = 'resistor';
  let family = '';
  let manufacturer = '';
  let quantity = 0;
  let location = '';

  // Resistor specific
  let resistance = 0;
  let wattage = 0;
  let tolerance = 0;

  let loading = false;
  let error: string | null = null;
  let success = false;

  onMount(async () => {
    const { data: locationData } = await supabase
      .from('locations')
      .select('*')
      .order('name');

      if (error) {
      console.error('Error fetching locations:', error);
      return;
    }

    locations = locationData ?? [];
  });

  async function handleSubmit() {
    loading = true;
    error = null;
    success = false;

    try {
      // Insert base component
      const { data: component, error: componentError } = await supabase
        .from('components')
        .insert({
          type,
          family,
          manufacturer,
          quantity,
          location_id: location,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (componentError) throw componentError;

      // Insert resistor specs if it's a resistor
      if (type === 'resistor' && component) {
        const { error: specsError } = await supabase
          .from('resistor_specs')
          .insert({
            component_id: component.id,
            resistance,
            wattage,
            tolerance
          });

        if (specsError) throw specsError;
      }

      success = true;
    } catch (e) {
      error = e instanceof Error ? e.message : 'An error occurred';
    } finally {
      loading = false;
    }
  }
</script>

<div class="max-w-2xl mx-auto p-4">
  <h1 class="text-2xl font-bold mb-6">Add New Component</h1>

  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <div>
      <label class="block text-sm font-medium mb-1" for="type">
        Type
      </label>
      <select
        id="type"
        bind:value={type}
        class="w-full p-2 border rounded"
      >
        <option value="resistor">Resistor</option>
      </select>
    </div>

    <div>
      <label class="block text-sm font-medium mb-1" for="family">
        Family
      </label>
      <input
        id="family"
        type="text"
        bind:value={family}
        class="w-full p-2 border rounded"
        placeholder="e.g., metal film"
      />
    </div>

    <div>
      <label class="block text-sm font-medium mb-1" for="manufacturer">
        Manufacturer
      </label>
      <input
        id="manufacturer"
        type="text"
        bind:value={manufacturer}
        class="w-full p-2 border rounded"
        placeholder="e.g., Yageo"
      />
    </div>

    <div>
      <label class="block text-sm font-medium mb-1" for="quantity">
        Quantity
      </label>
      <input
        id="quantity"
        type="number"
        bind:value={quantity}
        min="0"
        class="w-full p-2 border rounded"
      />
    </div>

    <div>
      <label class="block text-sm font-medium mb-1" for="location">
        Location
      </label>
      <select
        id="location"
        bind:value={location}
        class="w-full p-2 border rounded"
        required
      >
        <option value="">Select a location...</option>
        {#each locations as loc (loc.id)}
          <option value={loc.id}>{loc.name}</option>
        {/each}
      </select>
    </div>

    {#if type === 'resistor'}
      <div class="space-y-4">
        <h2 class="text-lg font-medium">Resistor Specifications</h2>

        <div>
          <label class="block text-sm font-medium mb-1" for="resistance">
            Resistance (Ω)
          </label>
          <input
            id="resistance"
            type="number"
            bind:value={resistance}
            min="0"
            class="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1" for="wattage">
            Wattage (W)
          </label>
          <input
            id="wattage"
            type="number"
            bind:value={wattage}
            min="0"
            step="0.25"
            class="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1" for="tolerance">
            Tolerance (%)
          </label>
          <input
            id="tolerance"
            type="number"
            bind:value={tolerance}
            min="0"
            step="0.1"
            class="w-full p-2 border rounded"
          />
        </div>
      </div>
    {/if}

    {#if error}
      <div class="text-red-500">{error}</div>
    {/if}

    {#if success}
      <div class="text-green-500">Component added successfully!</div>
    {/if}

    <button
      type="submit"
      disabled={loading}
      class="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
    >
      {loading ? 'Adding...' : 'Add Component'}
    </button>
  </form>
</div>