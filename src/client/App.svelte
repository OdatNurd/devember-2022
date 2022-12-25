<script>
  import { Router, Route } from 'svelte-navigator';

  import { NavBar, Toaster } from '$components';

  import Index from '$pages/index.svelte';
  import Graphics from '$pages/graphics.svelte';
  import Mixer from '$pages/mixer.svelte';
  import Settings from '$pages/settings.svelte';
  import Error404 from '$pages/404.svelte';
</script>

<div class="flex flex-col h-screen">
  <Toaster />
  <NavBar />

  <div class="flex flex-1 w-full overflow-hidden p-0 m-0">
    <div class="bg-base-100 h-full w-full m-0 p-0">
      <div class="w-full text-base-content m-0">
        <Router primary={false}>
          <Route path="/"        component={Index} />
          <Route path="graphics" component={Graphics} />
          <Route path="mixer"    component={Mixer} />
          <Route path="settings" component={Settings} />
          <Route path="*"        component={Error404} />
        </Router>
      </div>
    </div>
  </div>
</div>
