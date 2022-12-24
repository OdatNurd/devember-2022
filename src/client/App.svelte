<script>
  import { NavBar, Toaster, Dashboard } from '$components';
</script>

<div class="flex flex-col h-screen">
  <Toaster />
  <NavBar />

  <div class="flex flex-1 w-full overflow-hidden p-0 m-0">
    <div class="bg-base-100 h-full w-full m-0 p-0">
      <div class="w-full text-base-content m-0">
        <Dashboard />
      </div>
    </div>
  </div>
</div>
