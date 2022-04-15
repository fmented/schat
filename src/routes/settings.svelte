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
		<link rel="manifest" href="/manifest.json">
</svelte:head>
<Head/>

<main>
    <div class="ava">
        <label for="pic">Pic</label>
        <img src={avatar?avatar:$session.avatar} alt="user profile" on:click="{()=> {if(!process) avatar=randAva()}}">
        {#if avatar}
            <span on:click="{()=>{avatar=''}}">❌</span>
        {/if}
    </div>
    <div class="bio">
        <label for="nickname">Nickname</label>
        <input id="nickname" bind:value={nickname} disabled={process}>
        <label for="bio">Bio</label>
        <textarea id="" rows="6" bind:value={bio} disabled={process}></textarea>
        <button on:click="{save}" disabled={process}>Save</button>
    </div>
    <hr>
    <button on:click="{logout}" disabled={process}>Logout</button>
</main>

<style>

    main{
        margin-top: 100px;
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

    main .ava{
        max-width: min(50%, 300px);
        position: relative;
        margin: auto;
    }

    img{
        max-width: 100%;
        height: auto;
    }

    span{
        position: absolute;
        right: 1rem;
        top: 1rem
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

    hr{
        margin: 2rem;
    }

    textarea{
        border-radius: 4px;
        resize: none;
    }
</style>