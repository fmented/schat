<script lang="ts" context="module">
    import type {Load} from '@sveltejs/kit'
    import SearchForm from 'components/SearchForm.svelte'
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

<SearchForm/>