<script lang="ts">
  import type { PageData } from './types';
  import type { ComponentValueType, Database } from '$app/DatabaseDefinitions';
  import { ValueNormalizer } from '$lib/normalizers';
  import { onMount } from 'svelte';

  export let data: PageData;

  let componentTypes: Database['public']['Tables']['component_types']['Row'][] = [];
  let selectedType: Database['public']['Tables']['component_types']['Row'] | null = null;
  let family = '';
  let manufacturer = '';
  let quantity = 0;
  let location = '';
  let rawValue = '';

  let loading = false;
  let error: string | null = null;
  let success = false;

  $: valueType = selectedType?.value_type as ComponentValueType | null;
  $: valueLabel = getValueLabel(valueType);
  $: showValueInput = valueType !== null;

  function getValueLabel(type: ComponentValueType | null): string {
    switch (type) {
      case 'resistance': return 'Resistance (e.g., 10k, 4.7M)';
      case 'capacitance': return 'Capacitance (e.g., 22n, 0.1u)';
      case 'switch': return 'Configuration (e.g., SPDT, 2P3T)';
      default: return '';
    }
  }

  async function getNormalizedValue() {
    if (!valueType || !rawValue) return null;

    try {
      switch (valueType) {
        case 'resistance':
          return ValueNormalizer.normalizeResistance(rawValue);
        case 'capacitance':
          return ValueNormalizer.normalizeCapacitance(rawValue);
        case 'switch':
          return ValueNormalizer.normalizeSwitch(rawValue);
        default:
          return null;
      }
    } catch (e: any) {
      throw new Error(`Invalid ${valueType} value: ${e.message}`);
    }
  }

  async function handleSubmit() {
    if (!selectedType || !location) return;

    loading = true;
    error = null;
    success = false;

    try {
      const { data: { user }, error: userError } = await data.supabase.auth.getUser();
      if (userError || !user) throw new Error('Authentication error');

      let normalizedValue = null;
      if (showValueInput) {
        normalizedValue = await getNormalizedValue();
        if (!normalizedValue) throw new Error('Invalid component value');
      }

      const { data: component, error: componentError } = await data.supabase
        .from('components')
        .insert({
          type: selectedType.name,
          family,
          manufacturer,
          quantity,
          location,
          user_id: user.id
        })
        .select()
        .single();

      if (componentError || !component) throw componentError;

      if (normalizedValue) {
        const { error: valueError } = await data.supabase
          .from('normalized_values')
          .insert({
            component_id: component.id,
            base_value: normalizedValue.baseValue,
            display_value: normalizedValue.displayValue,
            value_type: valueType!,
            unit: normalizedValue.unit
          });

        if (valueError) throw valueError;
      }

      success = true;
      resetForm();
    } catch (e) {
      error = e instanceof Error ? e.message : 'An error occurred';
    } finally {
      loading = false;
    }
  }

  function resetForm() {
    family = '';
    manufacturer = '';
    quantity = 0;
    location = '';
    rawValue = '';
    selectedType = null;
  }

  onMount(async () => {
    const { data: types, error: loadError } = await data.supabase
      .from('component_types')
      .select('*')
      .order('name');

    if (loadError) {
      console.error('Error loading component types:', loadError);
      return;
    }

    componentTypes = types || [];
  });
</script>

<div class="max-w-2xl p-4 mx-auto">
  <h1 class="mb-6 text-2xl font-bold">Add New Component</h1>

  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <div>
      <label class="block mb-1 text-sm font-medium" for="type">Type</label>
      <select
        id="type"
        bind:value={selectedType}
        class="w-full p-2 border rounded"
        required
      >
        <option value={null}>Select a type...</option>
        {#each componentTypes as type}
          <option value={type}>{type.name}</option>
        {/each}
      </select>
    </div>

    {#if showValueInput}
      <div>
        <label class="block mb-1 text-sm font-medium" for="value">
          {valueLabel}
        </label>
        <input
          id="value"
          type="text"
          bind:value={rawValue}
          class="w-full p-2 border rounded"
          placeholder={valueLabel}
          required
        />
      </div>
    {/if}

    <div>
      <label class="block mb-1 text-sm font-medium" for="family">Family</label>
      <input
        id="family"
        type="text"
        bind:value={family}
        class="w-full p-2 border rounded"
        placeholder="e.g., metal film"
      />
    </div>

    <div>
      <label class="block mb-1 text-sm font-medium" for="manufacturer">
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
      <label class="block mb-1 text-sm font-medium" for="quantity">
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
      <label class="block mb-1 text-sm font-medium" for="location">
        Location
      </label>
      <select
        id="location"
        bind:value={location}
        class="w-full p-2 border rounded"
        required
      >
        <option value="">Select a location...</option>
        {#each data.locations as loc (loc.id)}
          <option value={loc.id}>{loc.name}</option>
        {/each}
      </select>
    </div>

    {#if error}
      <div class="text-red-500">{error}</div>
    {/if}

    {#if success}
      <div class="text-green-500">Component added successfully!</div>
    {/if}

    <button
      type="submit"
      disabled={loading}
      class="w-full px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-blue-400"
    >
      {loading ? 'Adding...' : 'Add Component'}
    </button>
  </form>
</div>
