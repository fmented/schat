<script context="module" lang="ts">
    import type {Load} from '@sveltejs/kit'
import { onMount } from 'svelte';
    export const load:Load = async ({session, params}) => {
        if(!session.user){
            return {
                status: 301,
                redirect: '/'
            }
        }
        
        if(session.user===params.user){
            return {
                status: 301,
                redirect: '/chat'
            }
        }
        const res = await fetch('/api/auth/detail', {method:'POST', body:JSON.stringify({deviceId:params.user})})
        if (res.ok) return {status:301, redirect:`/chat/${params.user}`}
        return{
            props:{
                u:params.user
            }
        }

    }

</script>

<script lang="ts">
import type { Database } from 'idb';
import type { Conversation} from 'interfaces';
import {initDB} from 'utils/helper'
import Message from 'components/Message.svelte';


    export let u:string
    let db:Database<{conv:Conversation}>
    let conversation:Conversation
    let process = true
    let h:number

    onMount(async ()=>{
        if(!u) window.location.href = '/chat'
        db = initDB()
        await db.open()
        const conv = await db.tables.conv.findOne({with:u})
        if(!conv) window.location.href = '/chat'
        conversation = conv
        process = false        
    })

</script>

{#if conversation}
    
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
      <strong class="username">{conversation.alias}</strong>
      <img src={conversation.thumbnail} alt={conversation.alias} height="30" width="30" />
    </div>

  <div class="chat" bind:clientHeight={h}>
    {#if !conversation.chat.length}
      <div>{process ? "Please Wait" : "No Chat Data"}</div>
    {:else}
      {#each conversation.chat || [] as chat}
        <Message message={chat} />
      {/each}
    {/if}
  </div>
</div>

{/if}

<style>

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
</style>

