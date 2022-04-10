<script lang="ts" context="module">
    import type {Load} from '@sveltejs/kit'
    import ConversatonList from 'components/ConversatonList.svelte';
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
<ConversatonList/>