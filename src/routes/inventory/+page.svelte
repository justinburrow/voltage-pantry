<script lang="ts">
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import { onDestroy } from 'svelte';

  export let data: PageData;

  $: components = data.components;
  $: totalCount = data.totalCount;
  $: currentPage = data.currentPage;
  $: totalPages = Math.ceil(totalCount / data.pageSize);
  $: loading = false;

  async function changePage(newPage: number) {
    if (newPage < 1 || newPage > totalPages) return;
    loading = true;
    await goto(`?page=${newPage}`, { keepFocus: true });
    loading = false;
  }

  $: {
    const subscription = data.supabase
      .channel('inventory-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'components',
          filter: `user_id=eq.${data.session?.user.id}`
        },
        async () => {
          const [{ count }, { data: newComponents }] = await Promise.all([
            data.supabase
              .from('components')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', data.session?.user.id),

            data.supabase
              .from('components')
              .select(`
                *,
                component_types (
                  name,
                  description
                ),
                resistor_specs (*)
              `)
              .eq('user_id', data.session?.user.id)
              .range((currentPage - 1) * data.pageSize, currentPage * data.pageSize - 1)
          ]);

          if (newComponents) components = newComponents;
          if (count !== null) totalCount = count;
        }
      )
      .subscribe();

    onDestroy(() => subscription.unsubscribe());
  }
</script>

<div class="space-y-6">
  <div class="flex justify-between items-center">
    <h1 class="text-2xl font-bold">Inventory ({totalCount} items)</h1>
    <div class="flex gap-2 items-center">
      <button
        on:click={() => changePage(currentPage - 1)}
        disabled={currentPage === 1 || loading}
        class="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
      >
        Previous
      </button>
      <span>Page {currentPage} of {totalPages}</span>
      <button
        on:click={() => changePage(currentPage + 1)}
        disabled={currentPage === totalPages || loading}
        class="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  </div>

  <div class="grid gap-4">
    {#each components as component (component.id)}
      <div class="p-4 border rounded-md hover:bg-gray-50">
        <div class="flex justify-between">
          <div>
            <h3 class="font-medium">
              {component.component_types?.name ?? component.type} - {component.family}
              {#if component.component_types?.description}
                <span class="text-sm text-gray-500 ml-2">
                  ({component.component_types.description})
                </span>
              {/if}
            </h3>
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
            <p class="text-sm text-gray-600">
              Location: {component.location || 'N/A'}
            </p>
          </div>
        </div>
      </div>
    {/each}

    {#if loading}
      <div class="text-center py-4 text-gray-600">Loading...</div>
    {/if}
  </div>
</div>