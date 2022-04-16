<script lang="ts">
import { sendRequest } from "utils";
import { createEventDispatcher} from 'svelte';
import {PUBLIC_KEY} from '$lib/secrets'
import {API_URL} from 'interfaces'
import {v4} from 'uuid'

const dt = Date.now();

let nickname = `user-${dt}`;
const d = createEventDispatcher()


let process= false

async function onClick(){
        if(!nickname) return 
        process = true
        const sw = await navigator.serviceWorker.ready
        const sub = await sw.pushManager.subscribe({
            applicationServerKey:PUBLIC_KEY,
            userVisibleOnly:true
        })
        const p256dh = sub.toJSON().keys.p256dh
        const auth = sub.toJSON().keys.auth
        const deviceId = v4()
        const subscribtion = {
            endpoint: sub.endpoint,
            keys: {auth, p256dh},
            nickname,
            deviceId,
        }
        await sendRequest(API_URL.AUTH_SUBSCRIBE, subscribtion)
        d('subscribed')
        process = false
    }
</script>

<div class="wrap">
    {#if process}
    <p>Please Wait</p>
    {/if}
    <label for="nickname">Nickname</label>
    <input type="text" id="nickname" bind:value="{nickname}">
    <button on:click|preventDefault={onClick} disabled={process}>Subscribe</button>
</div>

<style>
    
    .wrap{
        display: flex;
        flex-direction: column;
        gap: .25rem;
        padding: .5rem;
    }

    button{
        margin-top: .5rem;
        background: blueviolet;
        color: white;
    }

    input, button{
        padding: .5rem .25rem;
        border-radius: 4px;
    }

</style>