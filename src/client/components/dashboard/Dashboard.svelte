<script>
  import { onMount } from 'svelte';

  import { loadWorkspaceState, saveWorkspaceState } from '$lib/bundle.js';
  import DashboardPanel from './DashboardPanel.svelte';

  // When this is true, all of the panel items are blocked from taking any
  // mouse interaction.
  let blocked = false;

  // Get the state of the workspace to display; this is a combination of any
  // stored layout data from a prior load and the current information from when
  // the dashboard loaded.
  const panelList = loadWorkspaceState(omphalos.bundle, 'woz');

  // Once the components are all laid out, trigger the gridstack code to turn
  // on the magic.
  onMount(() => {
    // The gridstack instance; this holds the panel and drives the schoolbus.
    const grid = GridStack.init({
      cellHeight: 'initial',
      float: true,
      margin: 4,
      resizable: { handles: 'e,se,s,sw,w'},
      draggable: { handle: '.grid-stack-item-title', appendTo: 'body' },

      // When this is false, when the window gets narrower than minW, the
      // layout will change to a single column.
      disableOneColumnMode: false,
    });

    // Resizing and moving are an issue with iframes in the page because if
    // the mouse covers them, the eat events. So, as long as we are dragging
    // or resizing, block the panels from being interactive.
    grid.on('resizestart resizestop dragstart dragstop' , event => {
      blocked = (event.type.includes('start'));

      // If we're unblocking, save the state of the current layout; this is
      // either a size or a location change, but either way we want to know.
      if (blocked === false) {
        saveWorkspaceState(grid, 'woz');
      }
    });
  });
</script>

<div class="grid-holder">
  <div class="grid-stack">
    {#each panelList as panel (panel.name)}
      <DashboardPanel {...panel} {blocked} />
    {/each}
  </div>
</div>
