<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import type { ComponentValueType } from '$app/DatabaseDefinitions';
  import type { PageData, ActionData } from './types';

  export let data: PageData;
  export let form: ActionData;

  let selectedType = data.types?.[0];
  let loading = false;

  $: valueType = selectedType?.value_type as ComponentValueType | null;
  $: valueLabel = getValueLabel(valueType);

  function getValueLabel(type: ComponentValueType | null): string {
    switch (type) {
      case 'resistance': return 'Resistance (e.g., 10k, 4.7M)';
      case 'capacitance': return 'Capacitance (e.g., 22n, 0.1u)';
      case 'switch': return 'Configuration (e.g., SPDT, 2P3T)';
      default: return '';
    }
  }
</script>

<div class="max-w-2xl mx-auto">
  <h1 class="mb-6 text-2xl font-bold">Add New Component</h1>

  <form
    method="POST"
    class="space-y-4"
    use:enhance={() => {
      loading = true;
      return async ({ result }) => {
        loading = false;
        if (result.type === 'success') {
          // Reset form on success
          const form = document.querySelector('form') as HTMLFormElement;
          form?.reset();
          selectedType = data.types?.[0];
        }
      };
    }}
  >
    <div>
      <label for="type_id" class="block mb-1 text-sm font-medium">Type</label>
      <select
        id="type_id"
        name="type_id"
        bind:value={selectedType}
        class="w-full p-2 border rounded"
        required
      >
        {#each data.types as type}
          <option value={type.id}>{type.name}</option>
        {/each}
      </select>
    </div>

    {#if valueType}
      <div>
        <label for="value" class="block mb-1 text-sm font-medium">
          {valueLabel}
        </label>
        <input
          id="value"
          name="value"
          type="text"
          class="w-full p-2 border rounded"
          placeholder={valueLabel}
          required
        />
      </div>
    {/if}

    <div>
      <label for="family" class="block mb-1 text-sm font-medium">Family</label>
      <input
        id="family"
        name="family"
        type="text"
        class="w-full p-2 border rounded"
        placeholder="e.g., metal film"
      />
    </div>

    <div>
      <label for="manufacturer" class="block mb-1 text-sm font-medium">
        Manufacturer
      </label>
      <input
        id="manufacturer"
        name="manufacturer"
        type="text"
        class="w-full p-2 border rounded"
        placeholder="e.g., Yageo"
      />
    </div>

    <div>
      <label for="quantity" class="block mb-1 text-sm font-medium">Quantity</label>
      <input
        id="quantity"
        name="quantity"
        type="number"
        min="0"
        class="w-full p-2 border rounded"
        required
      />
    </div>

    <div>
      <label for="location_id" class="block mb-1 text-sm font-medium">
        Location
      </label>
      <select
        id="location_id"
        name="location_id"
        class="w-full p-2 border rounded"
        required
      >
        <option value="">Select a location...</option>
        {#each data.locations as location}
          <option value={location.id}>{location.name}</option>
        {/each}
      </select>
    </div>

    {#if form?.error}
      <div class="text-red-500">{form.error}</div>
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