<script lang="ts" context="module">
    import type {Load} from '@sveltejs/kit'
    import Conversation from 'components/Conversation.svelte'

    export const load:Load = async ({session, params, fetch}) => {
        if(!session.user){
            return {
                status: 301,
                redirect: '/'
            }
        }

        if(session.user===params.username){
            return {
                status: 301,
                redirect: '/chat'
            }
        }

        return {props:{
            u:params.username
        }}
    }
</script>

<script lang="ts">
    export let u:string
</script>

<Conversation withUser={u}/>