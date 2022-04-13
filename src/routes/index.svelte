<script lang="ts" context="module">
    import type {Load} from '@sveltejs/kit'
    import { onMount } from 'svelte';
    export const load:Load = async ({session}) => {
        if(session.user){
            return {
                status: 302,
                redirect: '/chat'
            }
        }
        return {}
    }
</script>

<script>
import SubscribtionForm from "components/SubscribtionForm.svelte"
</script>

<div>
    <strong>schat</strong>
</div>
<SubscribtionForm on:subscribed={()=>window.location.href="/chat"}/>

<style>
    div:first-of-type{
        background-color: blueviolet;
        color: white;
        padding: 1rem .5rem;
        margin-inline: -.5rem;
        margin-top: -.5rem;
        margin-bottom: .5rem;
        font-size: 1.4rem;
    }
</style>