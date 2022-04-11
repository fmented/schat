<script lang="ts">
import { onMount } from "svelte";
import { sendRequest, SWContainerBridge } from "utils";
import type { SWContainerBridge as SWCType } from "utils";
import {API_URL, type Chat, type Profile} from 'interfaces'
import type {Database} from 'idb'
import Message from './Message.svelte'
import {session} from '$app/stores'
import { initDB, getConversationWith, sendMessage as send } from "utils/helper";

export let withUser:string
let conversation:Chat[] = []
let s:SWCType

let db:Database<{chat:Chat, profile:Profile}>
let profile:Profile

onMount(async ()=>{
    db = initDB($session.user)
    await db.open()
    const profExist = await db.tables.profile.has({username:withUser})
    if(!profExist){
        const res = await (await sendRequest(API_URL.AUTH_DETAIL, {username:withUser})).json()
        profile = {username:withUser, avatar:res.avatar, bio:res.bio}
    }
    else{
        profile = await db.tables.profile.findOne({username:withUser})
    }
    conversation = await getConversationWith(db, withUser)
    await db.close()
    s = new SWContainerBridge(navigator.serviceWorker)
    await s.emit('open', $session.user)
    s.on('update', async _=>{
        if(!db) return
        conversation= await getConversationWith(db, withUser)
    })
    s.on('profile_update', p=>{
        if(profile.username === p.username) profile = p
    })

})


let process=false

async function sendMessage(e:KeyboardEvent) {
    if(!db || process) return
    process = true
    const el = e.target as HTMLInputElement
    if(e.key === 'Enter'){
        const val = el.value
        await send(db, {from:$session.user, to:withUser, content:val})
        el.value = ''
        conversation = await getConversationWith(db, withUser)
    }
    process = false
}


let h:number
</script>


<svelte:window bind:scrollY="{h}"/> 

<div class="wrap">
    {#if profile}  
    <div class="header">
        <strong><a href="/chat" aria-label="back">🔙</a></strong>
        <strong class="username">{profile.username}</strong>
        <img src="{profile.avatar}" alt="{profile.username}" height="30" width="30">
    </div>
    {/if}

    <div class="chat" bind:clientHeight="{h}">
        {#each conversation as chat}
        <Message message={chat}/>
        {/each}
    </div>
    
    <div class="form">
        <div>
            <label for="msg">msg</label>
            <input type="text" id="msg" placeholder="type something" on:keypress="{sendMessage}" disabled={process} autocomplete="off">
        </div>
    </div>
</div>
    
<style>
    label{
        height: 0;
        width: 0;
        opacity: 0;
        visibility: collapse;
        position: fixed;
        top: 0;
        left: 0;
    }

    .header{
        display: flex;
        height: 60px;
        padding: .25rem 1rem;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        align-items: center;
        background: black;
        z-index: 1;
        color: white;
        gap: 1rem;
        font-size: 1.4rem;
    }

    .header .username{
        flex-grow: 1;
    }

    .header + * {
        margin-top: calc(100px + .5rem);
    }

    input[type="text"]{
        height: calc(100% - 1rem);
        width: calc(100% - 2rem)
    }

    .form div{
        width: 100%;
        height: 4rem;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: .5rem;
        padding: .5rem .25rem;
    }

    .chat{
        padding-bottom: 6.5rem;
        display: flex;
        flex-direction: column;
    }

    .form {
        background-color: black;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 0 .5rem;
    }

</style>