<script>
  import { NavBar, Toaster } from '$components';

  import { Router, Route } from 'svelte-navigator';
  import { toast } from '$lib/toast.js'

  import Index from '$pages/index.svelte';
  import Graphics from '$pages/graphics.svelte';
  import Mixer from '$pages/mixer.svelte';
  import Settings from '$pages/settings.svelte';
  import Error404 from '$pages/404.svelte';

  // Listen for incoming toast requests from the system and dispatch them. This
  // relies on the fact that the payload is verified on the other end.
  omphalos.listenFor('toast', data => toast[data.level](data.toast, data.timeout));

  // Listen for incoming broadcasts telling us about the connection state of
  // bundle assets.
  omphalos.listenFor('__sys_socket_upd', data => console.log('socket update: ', data));

  // Pretend we did some sort of web request here as a part of the init, and we
  // ended up with a list of workspaces.
  const workspaces = [
    {
      "name": "WozSpace",
      "slug": "woz",
    }
  ]
</script>

<div class="flex flex-col h-screen">
  <Toaster />
  <NavBar {workspaces} />

  <div class="flex flex-1 w-full overflow-hidden p-0 m-0">
    <div class="bg-base-100 h-full w-full m-0 p-0">
      <div class="w-full text-base-content m-0">
        <Router primary={false}>
          <Route path="dashboard/*slug" component={Index} {workspaces}/>
          <Route path="graphics"        component={Graphics} />
          <Route path="mixer"           component={Mixer} />
          <Route path="settings"        component={Settings} />
          <Route path="*"               component={Error404} />
        </Router>
      </div>
    </div>
  </div>
</div>
