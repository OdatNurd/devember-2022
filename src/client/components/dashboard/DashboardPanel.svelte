<script>
  export let title = 'title goes here'
  export let content = 'content goes here';

  // If given, this ID is available in grid events to identify this panel.
  export let id = undefined;

  // Position of the panel; if either option is not provided, the position for
  // that axis is automatically set; so you can set x, y or both.
  export let x = undefined;
  export let y = undefined;

  // Initial dimensions of the the panel when it's created
  export let width = 1;
  export let height = 1;

  // Dimension ranges; no value means no constraints
  export let minWidth = undefined;
  export let minHeight = undefined;
  export let maxWidth = undefined;
  export let maxHeight = undefined;

  // If a panel is locked, it won't automatically move around while other things
  // are being resized or moved. The user can still move and resize; use the
  // below options if you also want to constrain that.
  export let locked = false;

  // Stop this panel from being resized or moved BY THE USER
  export let noResize = false;
  export let noMove = false;
</script>


<div class="grid-stack-item" gs-id={id}
                             gs-x={x} gs-y={y}
                             gs-w={width} gs-h={height}
                             gs-min-w={minWidth} gs-min-h={minHeight}
                             gs-max-w={maxWidth} gs-max-h={maxHeight}
                             gs-locked={locked}
                             gs-no-resize={noResize}
                             gs-no-move={noMove}
                             >
  <div class="grid-stack-item-content">
    <div class="grid-stack-item-title">{title}</div>
    <div class="panel-content">
      {content}
    </div>
  </div>
</div>

<style>
  .grid-stack-item {
    overflow: hidden;
  }

  .grid-stack-item-title   {
    font-size: 110%;
    font-weight: bold;
    background: yellow;
    color: black;
    border-bottom: 1px solid black;
    cursor: move;
  }

  .grid-stack-item-content {
    background-color: #18BC9C;
    color: black;
    overflow: hidden !important;
  }
</style>