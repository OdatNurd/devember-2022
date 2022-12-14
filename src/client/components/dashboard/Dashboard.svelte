<script>
  import { onMount } from 'svelte';

  onMount(() => {
    let grid = GridStack.init({
      cellHeight: 'initial',
      float: true,
      margin: 4,
      resizable: { handles: 'e,se,s,sw,w'},
      draggable: { handle: '.grid-stack-item-title', appendTo: 'body' },

      // When this is false, when the window gets narrower than minW, the
      // layout will change to a single column.
      disableOneColumnMode: false,
    });
  });

</script>

<div class="grid-holder">
  <div class="grid-stack">
    <slot></slot>
  </div>
</div>
