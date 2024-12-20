<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { goto } from '$app/navigation';
  import { onDestroy } from 'svelte';
  import type { PageData } from './$types';

  export let data: PageData;

  $: ({ components, totalCount, currentPage, pageSize } = data);
  $: totalPages = Math.ceil(totalCount / pageSize);
  $: loading = false;

  async function changePage(newPage: number) {
    if (newPage < 1 || newPage > totalPages) return;
    loading = true;
    await goto(`?page=${newPage}`, { keepFocus: true });
    loading = false;
  }

  // Subscribe to real-time updates
  const channel = data.supabase
    .channel('inventory-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'components',
        filter: `user_id=eq.${data.session?.user.id}`
      },
      () => {
        invalidateAll();
      }
    )
    .subscribe();

  onDestroy(() => {
    channel.unsubscribe();
  });
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold">Inventory ({totalCount} items)</h1>
    <div class="flex items-center gap-2">
      <button
        on:click={() => changePage(currentPage - 1)}
        disabled={currentPage === 1 || loading}
        class="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
        aria-label="Previous page"
      >
        Previous
      </button>
      <span class="text-sm">Page {currentPage} of {totalPages}</span>
      <button
        on:click={() => changePage(currentPage + 1)}
        disabled={currentPage === totalPages || loading}
        class="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
        aria-label="Next page"
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
            <p class="text-sm text-gray-600">Location: {component.location.name}</p>
          </div>
        </div>
      </div>
    {/each}

    {#if loading}
      <div class="py-4 text-center text-gray-600">Loading...</div>
    {/if}

    {#if components.length === 0 && !loading}
      <div class="py-8 text-center text-gray-600">
        <p>No components found</p>
        <a href="/add" class="text-blue-600 hover:underline">Add your first component</a>
      </div>
    {/if}
  </div>
</div>