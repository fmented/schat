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
    import {SWContainerBridge} from 'utils/bridge'
    import {session} from '$app/stores'
    import {sendRequest, randomAvatar} from 'utils'
    import {API_URL} from 'interfaces'
    import {initDB} from 'utils/helper'

let imgSrc:string = ''
let bioText = $session.bio

let process = false

async function save(){
    process = true
    const db = initDB($session.user)
    await db.open()
    const people = await db.tables.profile.retrieve(p=>p.username)
    await db.close()
    if(imgSrc && imgSrc !== $session.avatar){
        await sendRequest(API_URL.UPDATE_AVATAR, {receiver:people, content:imgSrc})
    }
    if(bioText !== $session.bio){
        await sendRequest(API_URL.UPDATE_BIO, {receiver:people, content:bioText})
    }
    process = false
    window.location.reload()
}


async function logout() {
    process = true
    const deviceId = localStorage.getItem('deviceId')
    const b = new SWContainerBridge(navigator.serviceWorker)
    await b.emit('before_logout', deviceId)

    b.on('unsubscribed', ()=>{
        localStorage.removeItem('deviceId')
        window.location.href = '/'
    })

    process = false
}


</script>

<main>
    <div class="ava">
        <label for="pic">Pic</label>
        <img src={imgSrc?imgSrc:$session.avatar} alt="user profile" on:click="{()=> {if(!process) imgSrc=randomAvatar()}}">
        {#if imgSrc}
            <span on:click="{()=>{imgSrc=''}}">❌</span>
        {/if}
    </div>
    <div class="bio">
        <label for="bio">Bio</label>
        <textarea id="" rows="6" bind:value={bioText} disabled={process}></textarea>
        <button on:click="{save}" disabled={process}>Save</button>
    </div>
    <hr>
    <button on:click="{logout}" disabled={process}>Logout</button>
</main>

<style>
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
        max-width: 50%;
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
        padding: .25em;
    }

    hr{
        margin: 2rem;
    }
</style>