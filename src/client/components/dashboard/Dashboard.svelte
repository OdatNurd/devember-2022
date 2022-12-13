<script>
  import { onMount } from 'svelte';

  onMount(() => {
    let grid = GridStack.init({
      cellHeight: 'auto', // or pixels; auto means same as column width
      float: true,
      margin: 4,
      resizable: { handles: 'all'},
      draggable: { handle: '.grid-stack-item-title', appendTo: 'body' }
    });
  });

</script>

<div class="grid-holder">
  <div class="grid-stack">
    <slot></slot>
  </div>
</div>
