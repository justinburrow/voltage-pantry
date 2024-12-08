<script lang="ts">
  import { page } from '$app/stores';
  import { supabase } from '$lib/db/supabase';
  import { goto } from '$app/navigation';

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      goto('/login');
    }
  }
</script>

{#if $page.url.pathname !== '/login'}
  <nav class="bg-gray-800 text-white p-4">
    <div class="max-w-7xl mx-auto flex justify-between items-center">
      <div class="flex space-x-4">
        <a href="/" class="hover:text-gray-300">Home</a>
        <a href="/inventory" class="hover:text-gray-300">Inventory</a>
        <a href="/add" class="hover:text-gray-300">Add Component</a>
      </div>
      <button
        on:click={signOut}
        class="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
      >
        Sign Out
      </button>
    </div>
  </nav>
{/if}

<main class="max-w-7xl mx-auto p-4">
  <slot />
</main>