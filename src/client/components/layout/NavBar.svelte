<script>
  import Icon from '../Icon.svelte';
  import Logo from '../Logo.svelte';
</script>


<div class="flex navbar bg-neutral text-neutral-content">
  <div class="navbar-start">

    <!-- The mobile menu; not visible on larger screen layouts. -->
    <div class="dropdown">
      <div class="btn btn-ghost lg:hidden">
        <Icon name="burger" size="1.5rem" />
      </div>
    </div>

    <Logo size={36} />
  </div>

  <div class="navbar-center hidden lg:flex">
    <!-- Normal menu; only available on larger screens. -->
  </div>

  <div class="navbar-end">
  </div>
</div>