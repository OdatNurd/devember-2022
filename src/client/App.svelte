<script>
  import { NavBar, Dashboard, DashboardPanel } from '$components';
</script>

<div class="flex flex-col h-screen">
  <NavBar />

  <div class="flex flex-1 w-full overflow-hidden p-0 m-0">
    <div class="bg-base-100 h-full w-full m-0 p-0">
      <div class="w-full text-base-content m-0">
        <Dashboard>
          <DashboardPanel title={'Panel 1'} width={2} height={2} content={'Sample Content 1'} />
          <DashboardPanel title={'Panel 2'} width={2} height={3} />
        </Dashboard>
      </div>
    </div>
  </div>
</div>
