<script lang="ts">
import { API_URL } from '$lib/interfaces';

import { sendRequest } from '$lib/utils';
import { onMount } from 'svelte';
import { initDB } from '$lib/utils/helper';



    onMount(async ()=>{
        const db = initDB()
        try {
            await db.delete()
            await sendRequest(API_URL.AUTH_UNSUBSCRIBE, undefined)
            window.location.href = '/'
        } catch (error) {
            window.location.reload()
        }
})

</script>