<script lang="ts">
  import { goto } from '$app/navigation';
  import { invalidate } from '$app/navigation';

  export let data;

  let email = '';
  let password = '';
  let loading = false;
  let error: string | null = null;

  async function handleLogin() {
    try {
      loading = true;
      const { data: authData, error: signInError } = await data.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) throw signInError;

      if (authData.session) {
        await invalidate('supabase:auth');
        await goto('/', { replaceState: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      error = err instanceof Error ? err.message : 'An error occurred';
    } finally {
      loading = false;
    }
  }
</script>


<div class="flex min-h-full flex-col justify-center px-6 py-12">
  <div class="sm:mx-auto sm:w-full sm:max-w-sm">
    <h2 class="text-center text-2xl font-bold leading-9 tracking-tight">
      Sign in to your account
    </h2>
  </div>

  <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
    <form class="space-y-6" on:submit|preventDefault={handleLogin}>
      <div>
        <label for="email" class="block text-sm font-medium leading-6">
          Email address
        </label>
        <div class="mt-2">
          <input
            id="email"
            name="email"
            type="email"
            required
            bind:value={email}
            class="block w-full rounded-md border-0 py-1.5 px-2 shadow-sm ring-1 ring-inset ring-gray-300"
          />
        </div>
      </div>

      <div>
        <label for="password" class="block text-sm font-medium leading-6">
          Password
        </label>
        <div class="mt-2">
          <input
            id="password"
            name="password"
            type="password"
            required
            bind:value={password}
            class="block w-full rounded-md border-0 py-1.5 px-2 shadow-sm ring-1 ring-inset ring-gray-300"
          />
        </div>
      </div>

      {#if error}
        <div class="text-red-500 text-sm">{error}</div>
      {/if}

      <div>
        <button
          type="submit"
          disabled={loading}
          class="flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </div>
    </form>
  </div>
</div>