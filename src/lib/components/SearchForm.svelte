<script lang="ts">
    import { sendRequest } from "utils";
    import {API_URL} from 'interfaces'
    import ListItem from './ListItem.svelte'
import Loading from "./Loading.svelte";

    let people:{avatar:string, nickname:string, bio:string, id:string}[]=[]
    let q = ''
    let process=false

    async function search() {
        if(!q) return
        process = true
        const res = await sendRequest(API_URL.AUTH_FIND, {deviceId: q})
        if(res.ok){
            people = await res.json()
        }        
        process = false
    }
</script>

<div>

    <div class="sd">
        <label for="search">Search</label>
        <input type="search" id="search" bind:value="{q}" disabled={process}>
        <button on:click="{search}" disabled={process}>Search</button>
    </div>
    
    <div class="s">
        {#each people as person}
        <a href="/chat/{person.id}">
            <ListItem img={person.avatar} text={{small:person.bio, strong:person.nickname}} />
        </a>
        {/each}
    </div>
</div>

<Loading show={process}/>
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
        background-color: blueviolet;
        padding: 1rem .25rem;
        margin-top: -.25rem;
    }

    button{
        margin-left: .25rem;
        background: black;
        border-radius: 4px;
        color: white;
        font-size: 1.2rem;
    }

    .s{
        padding: .5rem;
    }
</style>