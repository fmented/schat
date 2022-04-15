<script lang="ts" context="module">
    import type {Load} from '@sveltejs/kit'
    export const load:Load = async ({session}) => {
        if(session.user){
            return {
                status: 301,
                redirect: '/chat'
            }
        }
        return {}
    }
</script>

<script>
import SubscribtionForm from "components/SubscribtionForm.svelte"
</script>
<svelte:head>
		<link rel="manifest" href="/manifest.json">
</svelte:head>
<div>
    <strong>schat</strong>
</div>
<SubscribtionForm on:subscribed={()=>window.location.href="/chat"}/>

    <small><em>before you subscribe we encourage you to read more in <a href="/about">about</a> page.</em></small>
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