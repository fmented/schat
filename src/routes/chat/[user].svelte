<script lang="ts">
  import { onMount } from "svelte";
  import { sendRequest, SWContainerBridge } from "utils";
  import type { SWContainerBridge as SWCType } from "utils";
  import { API_URL } from "interfaces";
  import type { Conversation } from "interfaces";
  import type { Database } from "idb";
  import Message from "components/Message.svelte";
  import { session } from "$app/stores";
  import {
    initDB,
    updateMessageStatus,
    sendMessage as send,
    sortBy
  } from "utils/helper";
import Skeleton from "$lib/components/Skeleton.svelte";
import Loading from "$lib/components/Loading.svelte";

  export let user: string;
  export let avatar: string;
  export let nickname: string;
  
  let conversation: Conversation["chat"] = [];
  let s: SWCType;

  let db: Database<{ conv: Conversation }>;
  let loading = true;

  async function markasread() {
    await db.open();
    const conv = await db.tables.conv.findOne({ with: user });
    if (conv) {
      const chats = conv.chat
        .filter((c) => c.status === "received" && c.from === user)
        .map((c) => c.id);
      if (chats.length) {
        const res = await sendRequest(API_URL.MESSAGE_SEEN, {
          receiver: user,
          id: chats,
        });
        if (res.ok) {
          const conv = await db.tables.conv.findOne({ with: user });
          await conv.update({
            chat: updateMessageStatus(conv.chat, "seen", chats),
            alias:nickname, thumbnail:avatar
          });
        }
      }
    }
    conversation = conv
      ? (await db.tables.conv.findOne({ with: user })).chat
      : [];
    await s.emit('read', user)

  }



  onMount(async () => {
    s = new SWContainerBridge(navigator.serviceWorker);
    db = initDB();
    await db.open();
    await markasread();
    s.on("update", async (u) => {
      if (!db) return;
      if (u === user && window.location.href.endsWith(user)) {
        if(document.visibilityState === 'visible') return await markasread();
        document.onvisibilitychange = async ()=>{
          if(document.visibilityState==='visible'){
            await markasread()
            document.onvisibilitychange = null
          }
        }
      }
    });
    loading = false;
  });

  let process = false;
  let txt = "";

  async function sendMessage() {
    if (!db || process || !txt) return;
    process = true;
    await send(
      db,
      { from: $session.user, to: user, content: txt },
      { thumb: avatar, alias: nickname }
    );
    txt = "";
    if (conversation.length === 0) window.location.reload()
    conversation = (await db.tables.conv.findOne({ with: user })).chat;
    process = false;
  }

  let wrap: HTMLElement
  let h: number

  $: wrap && (()=>wrap.scrollTop = h)()
  
</script>

<svelte:head>
  <link rel="manifest" href="/manifest.webmanifest">
</svelte:head>

<Skeleton>
  <div class="header">
    <strong
      ><a href="/chat" aria-label="back" title="back" sveltekit:prefetch>
        <svg
          height="30px"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          version="1.1"
          id="Layer_1"
          x="0px"
          y="0px"
          viewBox="0 0 300.003 300.003"
          style="enable-background:new 0 0 300.003 300.003;"
          xml:space="preserve"
        >
          <g>
            <g>
              <path
                d="M150,0C67.159,0,0.001,67.159,0.001,150c0,82.838,67.157,150.003,149.997,150.003S300.002,232.838,300.002,150    C300.002,67.159,232.839,0,150,0z M189.226,218.202c-2.736,2.734-6.321,4.101-9.902,4.101c-3.582,0-7.169-1.367-9.902-4.103    l-56.295-56.292c-0.838-0.537-1.639-1.154-2.368-1.886c-2.796-2.799-4.145-6.479-4.077-10.144    c-0.065-3.667,1.281-7.35,4.077-10.146c0.734-0.731,1.53-1.349,2.368-1.886l56.043-56.043c5.47-5.465,14.34-5.467,19.808,0.003    c5.47,5.467,5.47,14.335,0,19.808l-48.265,48.265l48.514,48.516C194.695,203.864,194.695,212.732,189.226,218.202z"
              />
            </g>
          </g>
          <g />
          <g />
          <g />
          <g />
          <g />
          <g />
          <g />
          <g />
          <g />
          <g />
          <g />
          <g />
          <g />
          <g />
          <g />
        </svg>
      </a></strong
    >
    <strong class="username">{nickname}</strong>
    <img src={avatar} alt="{nickname} avatar" height="30" width="30" />
  </div>

  <div style="position: relative; overflow-y: scroll; max-height: calc(100% - 5rem);" bind:this="{wrap}">
    <div class="chat" bind:clientHeight="{h}">
      {#if !conversation.length}
        <div>{loading ? "Please Wait" : "No Chat Data"}</div>
      {:else}
        {#each sortBy(conversation, 'timeStamp') as chat}
          <Message message={chat} />
        {/each}
      {/if}
    </div>
  </div>

  <div class="form">
    <div>
      <label for="msg">msg</label>
      <textarea
        type="text"
        id="msg"
        placeholder="type something"
        bind:value={txt}
        disabled={process}
        autocomplete="off"
        rows="3"
      />
      <div title="send message">
      <svg
        id="Layer_1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        x="0px"
        y="0px"
        on:click={sendMessage}
        viewBox="0 0 481.882 481.882"
        style="enable-background:new 0 0 481.882 481.882;"
        xml:space="preserve"
        aria-label="send message"
        role="button"
      >
        <g>
          <g>
            <polygon points="0,221.867 101.682,278.761 440.712,54.322 		" />
          </g>
        </g>
        <g>
          <g>
            <polygon points="112.453,304.24 127.145,427.56 209.059,358.291 		" />
          </g>
        </g>
        <g>
          <g>
            <polygon points="118.351,288.088 221.923,346.038 464.34,59.04 		" />
          </g>
        </g>
        <g>
          <g>
            <polygon points="237.012,354.482 342.955,413.763 481.882,64.575 		" />
          </g>
        </g>
        <g />
        <g />
        <g />
        <g />
        <g />
        <g />
        <g />
        <g />
        <g />
        <g />
        <g />
        <g />
        <g />
        <g />
        <g />
      </svg>
    </div>

    </div>
  </div>
</Skeleton>

<Loading show={process||loading}/>

<style>
  label {
    height: 0;
    width: 0;
    opacity: 0;
    visibility: collapse;
    position: fixed;
    top: 0;
    left: 0;
  }

  .header {
    display: flex;
    height: 60px;
    padding: 0.25rem 1rem;
    align-items: center;
    background: blueviolet;
    z-index: 1;
    color: white;
    gap: 1rem;
    font-size: 1.4rem;
  }

  .header svg {
    vertical-align: bottom;
    fill: white;
  }

  .header .username {
    flex-grow: 1;
  }

  textarea {
    flex-grow: 1;
    border-radius: 4px;
    resize: none;
  }

  .form svg {
    width: 3rem;
    height: 3rem;
    cursor: pointer;
    fill: white;
  }

  .form>div {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: .5rem 0.25rem;
    gap: 0.25rem;
  }


  .chat {
    display: flex;
    flex-direction: column;
    position: relative;
    padding-inline: .5rem;
  }

  .chat div {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
  }

  .form {
    background-color: blueviolet;
    padding: 0 0.5rem;
    position: fixed;
    bottom: 0; 
    height: 5rem;
    left: 0;
    right: 0;
    display: grid;
    place-items: center;
  }
</style>
