<script>
  import DashboardPanel from './DashboardPanel.svelte';

  // The grid stack instance; this gets created only after all of the panels
  // load, in the reactive block below.
  let grid = null;
  let panelWrapper = null;

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
  }
</script>

<div class="grid-holder">
  {#await fetchUIPanels()}
    panels be loading
  {:then panels}
    <div class="grid-stack" bind:this={panelWrapper}>
      {#each panels as panel (panel.name)}
        <DashboardPanel {...panel} />
      {/each}
    </div>
  {/await}
</div>
