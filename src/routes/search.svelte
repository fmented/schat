<script lang="ts" context="module">
    import Head from 'components/Head.svelte';
    import type {Load} from '@sveltejs/kit'
    import SearchForm from 'components/SearchForm.svelte'
    export const load:Load = async ({session}) => {
        if(!session.user){
            return {
                status: 302,
                redirect: '/'
            }
        }
        return {}
    }
</script>

<Head/>
<SearchForm/>