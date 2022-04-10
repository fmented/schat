<script lang="ts">
    import type { Profile } from "interfaces";
    import { sendRequest } from "utils";
    import {API_URL} from 'interfaces'
    import ListItem from './ListItem.svelte'

    let people:Profile[]=[]
    let q = ''
    let process=false

    async function search() {
        if(!q) return
        process = true
        const res = await sendRequest(API_URL.AUTH_FIND, {username: q})
        if(res.ok){
            people = await res.json()
        }        
        process = false
    }
</script>

<div class="sd">
    <label for="search">Search</label>
    <input type="search" id="search" bind:value="{q}" disabled={process}>
    <button on:click="{search}" disabled={process}>Search</button>
</div>

<div>
    {#each people as person}
    <a href="/chat/{person.username}">
        <ListItem img={person.avatar} text={{small:person.bio, strong:person.username}} />
    </a>
    {/each}
</div>
<style>
    label{
        height: 0;
        width: 0;
        opacity: 0;
        visibility: collapse;
    }

    a{
        text-decoration: 0;
        color: black;
    }

    input{
        flex-grow: 1;
        padding: .5rem .25rem;
    }

    .sd{
        display: flex;
        justify-content: space-between;
        background-color: black;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 40px;
        padding: .5rem .25rem;
    }

    button{
        margin-left: .25rem;
    }

    div:not(.sd){
        margin-top: calc(40px + 1.25rem);
    }
</style>