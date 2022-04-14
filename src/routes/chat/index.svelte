<script lang="ts" context="module">
    import type {Load} from '@sveltejs/kit'
    export const load:Load = async ({session}) => {
        if(!session.user){
            return {
                status: 301,
                redirect: '/'
            }
        }
        return {}
    }
</script>
<script lang="ts">
    import { onMount } from "svelte";
    import { SWContainerBridge } from "utils";
    import type { SWContainerBridge as SWCType } from "utils";
    import type {Conversation, Message} from 'interfaces'
    import ListItem from 'components/ListItem.svelte'
    import {initDB, sortBy} from 'utils/helper'
    import type { Database } from "idb";
    import Head from 'components/Head.svelte'


    let db:Database<{conv:Conversation}>
    let conversation:{thumbnail:Conversation['thumbnail'], alias:Conversation['alias'], content:Message['content'], with:Conversation['with']}[]=[];
    let s:SWCType
    let loading=true

    onMount(async()=>{
        db = initDB()
        await db.open()
        conversation = sortBy((await db.tables.conv.all({direction:'prev'})).map(c=>({thumbnail:c.thumbnail, alias:c.alias, content:c.chat[c.chat.length-1].content, timeStamp:c.chat[c.chat.length-1].timeStamp, with:c.with})), 'timeStamp')
        s = new SWContainerBridge(navigator.serviceWorker)
        s.on('update', async _ => {
            if(!db) return
            conversation = sortBy((await db.tables.conv.all({direction:'prev'})).map(c=>({thumbnail:c.thumbnail, alias:c.alias, content:c.chat[c.chat.length-1].content, timeStamp:c.chat[c.chat.length-1].timeStamp, with:c.with})), 'timeStamp')
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
            <ListItem img={c.thumbnail} text={{strong:c.alias, small:c.content}}/>
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