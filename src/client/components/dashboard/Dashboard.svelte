<script>
  import { toast } from '$lib/toast.js'

  import DashboardPanel from './DashboardPanel.svelte';

  // The grid stack instance; this gets created only after all of the panels
  // load, in the reactive block below.
  let grid = null;
  let panelWrapper = null;

  // When this is true, all of the panel items are blocked from taking any
  // mouse interaction.
  let blocked = false;

  // Listen for incoming toast requests from the system and dispatch them. This
  // relies on the fact that the payload is verified on the other end.
  omphalos.listenFor('toast', data => toast[data.level](data.toast, data.timeout));

  const fetchUIPanels = async () => {
    const res = await fetch('/api/v1/panels');
    return res.json();
  }

  // When the main component body below renders out all of the fetched panel
  // components, it binds the panelWrapper to the wrapper div, which allows
  // this code to fire and initialize the grid.
  $: if (grid === null && panelWrapper !== null) {
    grid = GridStack.init({
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
    });
  }
</script>

<div class="grid-holder">
  {#await fetchUIPanels()}
    panels be loading
  {:then panels}
    <div class="grid-stack" bind:this={panelWrapper}>
      {#each panels as panel (panel.name)}
        <DashboardPanel {...panel} {blocked} />
      {/each}
    </div>
  {/await}
</div>
