<script lang="ts">
  import { onMount } from "svelte";
  import { sendRequest, SWContainerBridge } from "utils";
  import type { SWContainerBridge as SWCType } from "utils";
  import { API_URL} from "interfaces";
  import type { Conversation} from "interfaces";
  import type { Database } from "idb";
  import Message from "./Message.svelte";
  import { session } from "$app/stores";
  import {
    initDB,
    updateMessageStatus,
    sendMessage as send,
  } from "utils/helper";

  export let user: string;
  export let avatar: string
  export let nickname: string

  let conversation: Conversation['chat'] = [];
  let s: SWCType;

  let db: Database<{ conv: Conversation}>;
  let loading = true;

  async function markasread() {
    await db.open();
    const conv = (await db.tables.conv.findOne({with:user}))
    if(conv){
      const chats = conv.chat.filter(c=>c.status==='received').map(c=>c.id)
      if(chats.length){
        const res = await sendRequest(API_URL.MESSAGE_SEEN, {receiver:user, id:chats})
        if (res.ok){
          const conv = await db.tables.conv.findOne({with:user})
          await conv.update({chat:updateMessageStatus(conv.chat, 'seen', chats)})
        }
      }
    }
    conversation = conv?  (await db.tables.conv.findOne({with:user})).chat : []
  }

  onMount(async () => {
    db = initDB();
    await db.open();
    await markasread();
    s = new SWContainerBridge(navigator.serviceWorker);
    await s.emit("open", $session.user);
    s.on("update", async (u) => {
      if (!db) return;
      if (u === user) {
        await markasread();
      }
    });
    loading = false;
  });

  let process = false;
  let txt = "";

  async function sendMessage() {
    if (!db || process || !txt) return;
    process = true;
    await send(db, { from: $session.user, to: user, content: txt }, {thumb:avatar, alias:nickname});
    txt = "";
    conversation =  (await db.tables.conv.findOne({with:user})).chat
    process = false;
  }

  let h: number;
</script>

<svelte:window bind:scrollY={h} />

<div class="wrap">
    <div class="header">
      <strong
        ><a href="/chat" aria-label="back" >
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
      <img src={avatar} alt={user} height="30" width="30" />
    </div>

  <div class="chat" bind:clientHeight={h}>
    {#if !conversation.length}
      <div>{loading ? "Please Wait" : "No Chat Data"}</div>
    {:else}
      {#each conversation as chat}
        <Message message={chat} />
      {/each}
    {/if}
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
        rows="2"
      />
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
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
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

  .header + * {
    margin-top: calc(100px + 0.5rem);
  }

  textarea {
    height: calc(100% - 1rem);
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

  .form div {
    width: 100%;
    height: 4rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    padding: 0.5rem 0.25rem;
    gap: 0.25rem;
  }

  .chat {
    padding-bottom: 6.5rem;
    display: flex;
    flex-direction: column;
    position: relative;
    min-height: calc(100vh - 220px);
  }

  .chat div {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
  }

  .form {
    background-color: blueviolet;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 0 0.5rem;
  }
</style>
