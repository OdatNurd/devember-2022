<script>
  import Icon from '../Icon.svelte';
  import Logo from '../Logo.svelte';
</script>


<footer class="flex footer items-center p-4 bg-neutral text-neutral-content">
  <div class="items-center grid-flow-col">
    <Logo size={24} />
    <p>Copyright © 2022 OdatNurd - All right reserved</p>
  </div>
  <div class="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
  <a href="https://devember-2022.ruinouspileofcrap.com" aria-label="Documentation for this application"><Icon name="book" size="1.5rem"/></a>
  <a href="https://twitter.com/OdatNurd" aria-label="OdatNurd's Twitter Profile"><Icon name="twitter:brands" size="1.5rem"/></a>
  <a href="https://youtube.com/c/OdatNurd" aria-label="OdatNurd's YouTube Channel"><Icon name="youtube:brands" size="1.5rem"/></a>
  <a href="https://twitch.tv/odatnurd" aria-label="OdatNurd's Twitch Channel"><Icon name="twitch:brands" size="1.5rem"/></a>
  <a href="https://github.com/OdatNurd/devember-2022" aria-label="Source code for this application"><Icon name="github:brands" size="1.5rem"/></a>
  </div>
</footer>