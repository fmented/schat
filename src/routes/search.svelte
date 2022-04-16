<script lang="ts" context="module">
    import Head from 'components/Head.svelte';
    import type {Load} from '@sveltejs/kit'
    import SearchForm from 'components/SearchForm.svelte'
import Skeleton from '$lib/components/Skeleton.svelte';
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
<svelte:head>
		<link rel="manifest" href="/manifest.webmanifest">
</svelte:head>
<Skeleton>
    <Head/>
    <SearchForm/>
</Skeleton>