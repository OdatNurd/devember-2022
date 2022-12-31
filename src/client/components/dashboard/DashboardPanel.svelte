<script>
  import { createEventDispatcher } from 'svelte';

  import Icon from '../Icon.svelte';

  // For sending events to our parent.
  const dispatch = createEventDispatcher();

  // The grid that owns us and our panel component. The grid is a property we're
  // given when it is set up, and the panel represents our component in the
  // DOM when we mount
  export let grid = null;
  let panel = null;

  export let title = 'Untitled';
  export let content = 'missing.html';

  // The bundle the panel is from and the name that it has within that bundle;
  // taken together these are used to construct a unique identifier for this
  // panel.
  export let bundle = 'unassigned';
  export let name = 'unnamed'

  // The ID value of the bundle comes from its name and bundle combination
  let id = `${name}.${bundle}`;

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
  //
  // This is conveyed in the caption as a pushpin/circle.
  export let locked = false;

  // Stop this panel from being resized or moved BY THE USER.
  //
  // This is conveyed in the caption as a padlock; unlocked means this can be
  // moved around, locked means it cannot.
  export let noMove = false;

  // When this is true, the panel does not allow you to resize it. We turn this
  // on whenever the minimum and maximum width are the same value, since that
  // is an indication that the panel is intended to be a set size.
  export let noResize = false;

  // When true, the content area of the panel is blocked; no interaction with
  // it is possible.
  export let blocked = false;

  // Returns true if this panel cannot be resized because the dimension
  // contraints are all identical.
  const cannotResize = () => {
    return width === minWidth && width === maxWidth &&
           height === minHeight && height === maxHeight;
  }

  // On initial load, force noResize to be turned on if the dimensions say that
  // the panel can't be resized. Otherwise it will have handles but they will
  // do nothing, which is offputting since the block overlay will turn on in
  // that case.
  if (cannotResize() === true) {
    noResize = true;
  }

  // Trigger an event to reload this panel.
  const reload = () => {
    omphalos.sendMessageToBundle('__sys_reload', bundle, {
      "type": ["panel"],
      "name": [name]
    });
  }

  // Toggle the pinned state on the panel; when pinned, the system can't bump
  // panels out of the way, but the user can move them if they like.
  const pin = () => {
    locked = !locked;

    grid.update(panel, { locked });
    dispatch('update');
  }

  // Toggle the locked state n the panel; when locked, you cannot move or resize
  // a panel manually (but it may still move out of the way automatically if  it
  // is not pinned).
  const lock = () => {
    noMove = !noMove;

    // If we just locked movement, also lock resizing; otherwise, set the state
    // of being able to resize based on wether or not the dimensions allow it.
    if (noMove === true) {
      noResize = true;
    } else {
      noResize = cannotResize();
    }

    grid.update(panel, { noResize, noMove });
    dispatch('update');
  }
</script>


<div class="grid-stack-item" gs-id={id}
                             gs-x={x} gs-y={y}
                             gs-w={width} gs-h={height}
                             gs-min-w={minWidth} gs-min-h={minHeight}
                             gs-max-w={maxWidth} gs-max-h={maxHeight}
                             gs-locked={locked}
                             gs-no-resize={noResize}
                             gs-no-move={noMove}
                             bind:this={panel}>
  <div class="grid-stack-item-content rounded-tl-lg rounded-br-lg border-neutral-focus border-4">
    <div class:noMove class="grid-stack-item-title bg-primary text-primary-content rounded-tl-lg border-neutral-focus border-1 p-1">
      <span>{title}</span>

      <div class="flex">
        {#if window.omphalos.config.developerMode}
          <div class="tooltip tooltip-left" data-tip="Reload">
            <button on:click={reload} class="btn btn-circle btn-xs btn-primary" aria-label="Reload Panel">
              <Icon name={'rotate-right'} size="0.75rem" />
            </button>
          </div>
        {/if}

        <div class="tooltip tooltip-left" data-tip="Open">
          <a target="_blank" rel="nofollow noreferrer" href={`/bundles/${bundle}/panels/${content}`} class="btn btn-xs btn-circle btn-primary" aria-label="Open In New Tab">
            <Icon name={'up-right-from-square'} size="0.75rem" />
          </a>
        </div>

        <div class="tooltip tooltip-left" data-tip={locked ? 'Unpin' : 'Pin'}>
          <button on:click={pin} class="btn btn-xs btn-circle btn-primary" aria-label="Pin/Unpin this panel">
            <Icon name={locked ? 'circle' : 'thumbtack'} size="0.75rem" />
          </button>
        </div>

        <div class="tooltip tooltip-left" data-tip={noMove ? 'Unlock' : 'Lock'}>
          <button on:click={lock} class="btn btn-xs btn-circle btn-primary" aria-label="Pin/Unpin this panel">
            <Icon name={noMove ? 'lock' : 'lock-open'} size="0.75rem" />
          </button>
        </div>
      </div>

    </div>
    <div class="panel-content bg-neutral text-neutral-content p-0 m-0 h-full w-full relative rounded-br-lg border-neutral-focus border-1">
      <iframe src={`/bundles/${bundle}/panels/${content}`} {title}> </iframe>
      <div class="blocker" class:blocked></div>
    </div>
  </div>
</div>

<style>
  .noMove {
    cursor: not-allowed !important;
  }

  /* The wrapper div that gridstack uses to control this item. This is the
   * overall container for the whole panel.. */
  .grid-stack-item {
    overflow: hidden;
  }

  /* The wrapper div for all of the content in our panel; this wraps both the
   * title and the actual content part. */
  .grid-stack-item-content {
    overflow: hidden !important;
    display: grid;
    grid-template-rows: min-content auto;
  }

  /* The wrapper div that represents the title bar of the panel; you can click
   * and drag on this beast if you like, to move the thing around. */
  .grid-stack-item-title   {
    font-size: 110%;
    font-weight: bold;
    display: grid;
    grid-template-columns: auto min-content;

    cursor: move;
  }

  /* The wrapper that holds the actual contents of the panel itself. */
  .panel-content {
    overflow: hidden !important;
  }

  /* A div that sits on top of the iframe and will block access to it. This is
   * selectively enabled whenever a drag operation on a panel starts, and is
   * then turned off as needed. */
  .blocker {
    display: none;
    position: absolute;
    background: black;
    opacity: 0.5;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }

  /* This class is applied when the panel is blocked; it essentially "turns on"
   * the blocker class above as needed. */
  .blocked {
    display: block;
  }

  iframe {
    width: 100%;
    height: 100%;
  }
</style>