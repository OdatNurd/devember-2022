<script>
  import { toast } from '$lib/toast.js';
  import { link } from 'svelte-navigator';

  import Icon from '../Icon.svelte';
  import Logo from '../Logo.svelte';

  export let workspaces;
</script>


<div class="flex navbar bg-neutral text-neutral-content">
  <div class="navbar-start">
    <Logo size={36} />
    <div class="tabs ml-4">
      {#each workspaces as workspace (name)}
        <a href="/dashboard/{workspace.slug}" use:link class="tab tab-lg tab-bordered tab-active">{workspace.name}</a>
      {/each}
    </div>
  </div>

  <div class="navbar-center hidden lg:flex">
    <!-- Normal menu; only available on larger screens. -->
  </div>

  <div class="navbar-end">
    <div class="tooltip tooltip-bottom" data-tip="Graphics">
      <a  href="/graphics" use:link class="btn btn-circle" aria-label="Open Graphics Page">
        <Icon name={'layer-group'} size="1.5rem" />
      </a>
    </div>

    <div class="tooltip tooltip-bottom" data-tip="Mixer">
      <a href="/mixer" use:link class="btn btn-circle" aria-label="Open Mixer Page">
        <Icon name={'headphones-simple'} size="1.5rem" />
      </a>
    </div>

    <div class="tooltip tooltip-bottom" data-tip="Docs">
      <a target="_blank" rel="nofollow noreferrer" href="https://devember-2022.ruinouspileofcrap.com" class="btn btn-circle" aria-label="Open Documentation Site">
        <Icon name={'book'} size="1.5rem" />
      </a>
    </div>

    <div class="tooltip tooltip-left" data-tip="Settings">
      <a href="/settings" use:link class="btn btn-circle" aria-label="Open Settings Page">
        <Icon name={'gear'} size="1.5rem" />
      </a>
    </div>
  </div>
</div>