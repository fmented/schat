<script lang="ts">
    import {sendRequest} from 'utils'
    import {API_URL} from 'interfaces'
    import { createEventDispatcher } from 'svelte';
    
    let username=''
    let password=''
    let email=''
    let message=''
    const d = createEventDispatcher()
    
    let process=false

    async function onClick(){
        if(!username || !password || !email) return 
        process = true
        const res = await sendRequest(API_URL.AUTH_SIGNUP, {username, password, email}, fetch)
        if(res.ok){
            const {status} = await res.json() 
            if(status == 'error') {
                message = 'username or email is already used'
            }
            else d('created')
        }
        process = false
    }
    </script>
    
    <div class="wrap">
    
        <p>{process? 'Please Wait': message}</p>
        
        <label for="username">Username</label>
        <input type="text" id="username" bind:value="{username}">
        
        <label for="email">Email</label>
        <input type="text" id="email" bind:value="{email}">
    

        <label for="password">Password</label>
        <input type="password" id="password" bind:value="{password}">
        
        <button on:click={onClick}>Sign Up</button>
    </div>
    
    <style>
        .wrap{
            display: flex;
            flex-direction: column;
            gap: .25rem;
        }

        button{
            margin-top: .5rem;
        }

        input, button{
            padding: .5rem .25rem;
        }
    </style>