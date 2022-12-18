<script>
  import Icon from '../Icon.svelte';
  import Logo from '../Logo.svelte';
</script>


<div class="flex navbar bg-neutral text-neutral-content">
  <div class="navbar-start">
    <Logo size={36} />
    <div class="tabs ml-4">
      <button class="tab tab-lg tab-bordered tab-active">Workspace</button>
    </div>
  </div>

  <div class="navbar-center hidden lg:flex">
    <!-- Normal menu; only available on larger screens. -->
  </div>

  <div class="navbar-end">
    <div class="tooltip tooltip-bottom" data-tip="Graphics">
      <button class="btn btn-circle" aria-label="Open Graphics Page">
        <Icon name={'layer-group'} size="1.5rem" />
      </button>
    </div>

    <div class="tooltip tooltip-bottom" data-tip="Mixer">
      <button class="btn btn-circle" aria-label="Open Mixer Page">
        <Icon name={'headphones-simple'} size="1.5rem" />
      </button>
    </div>

    <div class="tooltip tooltip-bottom" data-tip="Docs">
      <a target="_blank" rel="nofollow noreferrer" href="https://devember-2022.ruinouspileofcrap.com" class="btn btn-circle" aria-label="Open Documentation Site">
        <Icon name={'book'} size="1.5rem" />
      </a>
    </div>

    <div class="tooltip tooltip-left" data-tip="Settings">
      <button class="btn btn-circle" aria-label="Open Settings Page">
        <Icon name={'gear'} size="1.5rem" />
      </button>
    </div>
  </div>
</div>