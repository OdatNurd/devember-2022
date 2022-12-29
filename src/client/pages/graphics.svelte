<script>
  import { Content, Icon } from '$components';

  import { toast } from '$lib/toast.js'
  import { graphicsList } from '$lib/bundle.js';

  const bundles = graphicsList(omphalos.bundle);

  // Obtain the full URL for a graphic
  const graphicURL = (bundle, graphic) => {
    return `${window.location.origin}/bundles/${bundle.name}/graphics/${graphic.file}`;
  }

  // Copy the full URL for a graphic to the clipboard.
  const copyUrl = (bundle, graphic) => {
    navigator.clipboard.writeText(graphicURL(bundle, graphic));
    toast.success(`Copied URL for ${graphic.name} to the clipboard!`);
  }
</script>

<Content>
  <div class="wrapper rounded-tl-lg rounded-br-lg border-neutral-focus border-4 min-w-[50%]">

    {#if bundles.length === 0}
        <div class="font-bold wrapper-title bg-primary text-primary-content rounded-tl-lg rounded-br-lg border-neutral-focus border-1 p-1">
          <span class="text-xl">No loaded bundles contain graphics</span>
        </div>
    {:else}
      {#each bundles as bundle (name)}
        <!-- Per Bundle; this sets the name -->
        <div class="font-bold wrapper-title bg-primary text-primary-content rounded-tl-lg border-neutral-focus border-1 p-1">
          <span class="text-xl">{bundle.name}</span>
          <div class="tooltip tooltip-bottom" data-tip="Reload all graphics in this bundle">
            <button class="btn btn-circle btn-xs btn-primary" aria-label="Reload All Graphics">
              <Icon name={'rotate-right'} size="0.75rem" />
            </button>
          </div>
        </div>

        <!-- Per Bundle; This is the list of graphics. -->
        <div class="bg-neutral text-neutral-content p-0 m-0 mb-2 h-full w-full relative rounded-br-lg border-neutral-focus border-1">

          {#each bundle.graphics as graphic (name)}

            <!-- Per Graphic; Covers the entire shiboodle -->
            <div class="flex justify-between px-4 mt-2 py-2 bg-secondary text-secondary-content">
              <!-- Load count, link and size -->
              <div class="flex flex-grow items-center justify-between">
                <div class="flex-none px-2">--</div>
                <div class="font-bold underline flex-grow"><a target="_blank" rel="nofollow noreferrer" href="{graphicURL(bundle, graphic)}">{graphic.file}</a></div>
                <h3 class="flex-none">{graphic.size.width}x{graphic.size.height}</h3>
              </div>

              <!-- Two buttons -->
              <div class="flex ml-2">
                <div class="tooltip tooltip-bottom" data-tip="Copy URL">
                  <button on:click={() => copyUrl(bundle, graphic)} class="btn btn-circle btn-primary ml-1" aria-label="Copy URL">
                    <Icon name={'chain'} size="1rem" />
                  </button>
                </div>

                <div class="tooltip tooltip-bottom" data-tip="Reload this graphic">
                  <button class="btn btn-circle btn-primary ml-1" aria-label="Reload this graphic">
                    <Icon name={'rotate-right'} size="1rem" />
                  </button>
                </div>
              </div>
            </div>
          {/each}

        </div>
      {/each}
    {/if}

  </div>
</Content>

<style>
  .wrapper {
    display: grid;
    grid-template-rows: min-content auto;
  }

  .wrapper-title   {
    display: grid;
    grid-template-columns: auto min-content;
  }
</style>