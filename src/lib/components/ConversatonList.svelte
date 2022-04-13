<script lang="ts">
    import { onMount } from "svelte";
    import { SWContainerBridge } from "utils";
    import type { SWContainerBridge as SWCType } from "utils";
    import type {Conversation} from 'interfaces'
    import ListItem from './ListItem.svelte'
    import { session } from '$app/stores'
    import {initDB} from 'utils/helper'
    import type { Database } from "idb";
    import Head from 'components/Head.svelte'


    let db:Database<{conv:Conversation}>
    let conversation:Conversation[]=[];
    let s:SWCType
    let loading=true

    onMount(async()=>{
        db = initDB()
        await db.open()
        conversation = await db.tables.conv.all()
        s = new SWContainerBridge(navigator.serviceWorker)
        await s.emit('open', $session.user)
        s.on('update', async _ => {
            if(!db) return
            conversation = await db.tables.conv.all()
        })

        loading = false
    })

</script>

<Head>
schat
</Head>

<div class="conv">
    {#if !conversation.length}
    <div class="chat">{loading? 'Loading Data': 'No Conversation'}</div>
       {:else} 
        {#each conversation as c}
        <a href="/chat/{c.with}/" >
            <ListItem img={c.thumbnail} text={{strong:c.alias, small:c.chat[c.chat.length-1].content}}/>
        </a>
        {/each}
    {/if}
</div>
    
<style>
    a{
        text-decoration: none;
        color: inherit;
    }
    .conv{
        margin-top: calc(50px + 1.25rem);
        position: relative;
        min-height: calc(100vh - 100px);
    }

    .chat{
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
    }


</style>