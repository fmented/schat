<script lang="ts" context="module">
    import type {Load} from '@sveltejs/kit'
    import LoginForm from 'components/LoginForm.svelte'
    import RegisterForm from 'components/RegisterForm.svelte'
import { onMount } from 'svelte';
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
    let forceToLogin = false
    let form = 'register'

    onMount(async ()=>{
    })
</script>

{#if !forceToLogin}
    <div>
        <button on:click="{()=>form='register'}">Sign Up</button>
        <button on:click="{()=>form='login'}">Login</button>
    </div>
{/if}

{#if form === 'register'}
    <RegisterForm on:created={()=>{
        forceToLogin=true
        form='login'
        }}/>
    {:else}
    <LoginForm on:loggedin={()=>window.location.reload()}/>
{/if}