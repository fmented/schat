<script lang="ts">
    import { onMount } from "svelte";
    import { SWContainerBridge } from "utils";
    import type { SWContainerBridge as SWCType } from "utils";
    import type {Chat, Profile} from 'interfaces'
    import ListItem from './ListItem.svelte'
    import { session } from '$app/stores'
    import {initDB, getConversationList} from 'utils/helper'
    import type { Database } from "idb";


    let db:Database<{chat:Chat, profile:Profile}>
    let conversation:(Chat & {pic:string, with:string})[]=[];
    let s:SWCType

    onMount(async()=>{
        db = initDB($session.user)
        conversation = await getConversationList(db)
        s = new SWContainerBridge(navigator.serviceWorker)
        await s.emit('open', $session.user)
        s.on('update', async _ => {
            if(!db) return
            conversation = await getConversationList(db)
        })
    })
</script>

<div class="header">
    <a href="/settings">Settings</a>
    <a href="/search">Search</a>
</div>

<div>
    {#each conversation as chat}
    <a href="/chat/{chat.from === $session.user? chat.to : chat.from}/">
        <ListItem img={chat.pic} text={{strong:chat.with, small:chat.content}}/>
    </a>
    {/each}
</div>
    
<style>
    a{
        text-decoration: none;
        color: inherit;
    }

    .header{
        display: flex;
        flex-direction: row-reverse;
        height: 50px;
        padding: .5rem .25rem;
        background-color: black;
        color: white;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        gap: 1rem;
        align-items: center;
        padding-right: .5rem;
        font-size: 1.4rem;
    }

    div:not(.header){
        margin-top: calc(50px + 1.25rem);
    }
</style>