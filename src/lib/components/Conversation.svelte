<script lang="ts">
import { onMount } from "svelte";
import { sendRequest, SWContainerBridge } from "utils";
import type { SWContainerBridge as SWCType } from "utils";
import {API_URL, type Chat, type Profile} from 'interfaces'
import type {Database} from 'idb'
import Message from './Message.svelte'
import {session} from '$app/stores'
import { initDB, getConversationWith, sendMessage as send } from "utils/helper";
import {loRes} from 'utils/canvas'

export let withUser:string
let conversation:Chat[] = []
let files:FileList
let s:SWCType

let wrapper:HTMLElement
let chat:HTMLElement
let fileInput: HTMLInputElement
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

$: if(files){
    const f = files[0]
    const reader = new FileReader()
    reader.readAsDataURL(f)
    reader.onload = async ()=>{
        const content = await loRes(reader.result as string)
        if(!db || process) return
        process = true
        await send(db, {from:$session.user, to:withUser, content})
        conversation = await getConversationWith(db, withUser)
        files = undefined
        process = false
    }
}

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

<div class="wrap" bind:this="{wrapper}">
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
            <input type="text" id="msg" placeholder="type something" on:keypress="{sendMessage}" disabled={process}>
            <label for="pic">pic</label>
            <input type="file" id="pic" bind:files="{files}" bind:this="{fileInput}" accept="image/*" disabled={process}>
            <span on:click="{()=>fileInput.click()}">📎</span>
        </div>
    </div>
</div>
    
<style>
    label, input[type="file"]{
        height: 0;
        width: 0;
        opacity: 0;
        visibility: collapse;
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
        flex-grow: 1;
        height: 50%;
    }

    span{
        font-size: 3rem;
    }

    .form div{
        width: 100%;
        height: 4rem;
        display: flex;
        padding: 1rem .5rem;
        justify-content: center;
        align-items: center;
        margin-bottom: .5rem;
    }

    .chat{
        padding-bottom: 6.5rem;
        display: flex;
        flex-direction: column;
        gap: .25rem;
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