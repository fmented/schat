<script lang="ts" context="module">
    import type {Load} from '@sveltejs/kit'
    export const load:Load = async ({session}) => {
        if(!session.user){
            return {
                status: 302,
                redirect: '/'
            }
        }
        return {}
    }
</script>

<script lang="ts">
    import {SWContainerBridge} from 'utils/bridge'
    import {session} from '$app/stores'
    import {sendRequest, randAva} from 'utils'
    import {API_URL} from 'interfaces'
    import Head from 'components/Head.svelte'
import Skeleton from '$lib/components/Skeleton.svelte'

let avatar = ''
let bio = $session.bio
let nickname = $session.nickname
let process = false

async function save(){
    process = true
    await sendRequest(API_URL.UPDATE_PROFILE, {avatar:avatar?avatar:$session.avatar, bio, nickname})
    process = false
    window.location.reload()
}


async function logout() {
    process = true
    const b = new SWContainerBridge(navigator.serviceWorker)
    await b.emit('before_unsubscribe', undefined)
    b.on('unsubscribed', async ()=>{
    await sendRequest(API_URL.AUTH_UNSUBSCRIBE, undefined)        
        
        process = false
        window.location.href = '/'
    })
}


</script>
<svelte:head>
		<link rel="manifest" href="/manifest.webmanifest">
</svelte:head>
<Head/>


<Skeleton>
    <div class="ava">
        <label for="pic">Pic</label>
        <img src={avatar?avatar:$session.avatar} alt="user profile" on:click="{()=> {if(!process) process=true;avatar=randAva()}}" on:load="{()=>process=false}">
        {#if avatar}
            <span on:click="{()=>{avatar=''}}">❌</span>
        {/if}
    </div>
    <div class="wrap">
    <div class="bio">
        <label for="nickname">Nickname</label>
        <input id="nickname" bind:value={nickname} disabled={process}>
        <label for="bio">Bio</label>
        <textarea id="" rows="6" bind:value={bio} disabled={process}></textarea>
        <button on:click="{save}" disabled={process}>Save</button>
    </div>

        <hr>
        <button on:click="{logout}" disabled={process} style="background-color: red;">Logout</button>
    </div>
    
</Skeleton>
<main>
</main>

<style>

:global(button:disabled){
    filter: saturate(.5);
}
    label {
        width: 100%;
    }

    label[for=pic]{
        height: 0;
        width: 0;
        opacity: 0;
        visibility: collapse;
    }

    .ava{
        max-width: min(50%, 300px);
        position: relative;
        margin: auto;
        margin-top: 2rem;
    }

    img{
        max-width: 100%;
        height: auto;
    }

    span{
        position: absolute;
        right: -1.5rem;
        top: -1.5rem;
        cursor: pointer;
    }

    .bio{
        display: flex;
        flex-direction: column;
        gap: .25em;
    }

    button{
        width: 100%;
        padding: .5em .25em;
        color: white;
        background: blueviolet;
        border-radius: 4px;
    }


    .wrap{
        padding: .5rem;
    }
    textarea{
        border-radius: 4px;
        resize: none;
    }
</style>