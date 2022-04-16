<script lang="ts" context="module">
  import type { Load } from "@sveltejs/kit";
  export const load: Load = async ({ session }) => {
    if (session.user) {
      return {
        status: 301,
        redirect: "/chat",
      };
    }
    return {};
  };
</script>

<script lang="ts">
  import Skeleton from "$lib/components/Skeleton.svelte";
import SubscribtionForm from "components/SubscribtionForm.svelte";
  import { onMount } from "svelte";

  let support: boolean;
  onMount(() => {
    if (!window.indexedDB || !navigator.serviceWorker || !window.PushManager) {
      support = false;
    }
    support = true;
  });
</script>

<svelte:head>
  <link rel="manifest" href="/manifest.webmanifest" />
</svelte:head>
{#if support}
<Skeleton>

  <div>
    <strong>schat</strong>
  </div>
  <div>
    <SubscribtionForm on:subscribed={() => (window.location.href = "/chat")} />
      <small
      ><em
      >before you subscribe we encourage you to read more in <a href="/about"
      >about</a
      > page.</em
      ></small
      >
    </div>
  </Skeleton>
  {:else}
  <h1>Your browser doesn't support a few API that we need to make this app work. <a href="/about">learn more</a></h1>
{/if}

<style>
  div:first-of-type {
    background-color: blueviolet;
    color: white;
    padding: 1rem .5rem;
    margin-bottom: 0.5rem;
    font-size: 1.4rem;
  }

  small{
      margin: .5rem;
      display: block;
  }
</style>
