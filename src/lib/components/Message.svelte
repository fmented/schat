<script lang="ts">
    import type {Message} from 'interfaces'
    import {session} from '$app/stores'
    export let message:Message


    function parseDate(timeStamp:number) {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        const d = new Date(timeStamp)
        return `${d.getDate()} ${months[d.getMonth()]} @ ${twoDigits(d.getHours())}:${twoDigits(d.getMinutes())}`
    }

    function twoDigits(n:number){
        const str = `${n}`
        if(str.length===1) return `0${str}`
        return str
    }
</script>

<div class="wrap" class:right={message.from === $session.user}>
    <div class="msg">
        {#if message.content.startsWith('data:image')}
        <img src={message.content} alt="unknown">
        {:else}
        <p>{message.content}</p>
        {/if}
        <div>
            <span>{parseDate(message.timeStamp)}</span>
            {#if message.from === $session.user}
                <span>{
                message.status==='pending'?'⏱'
                :message.status === 'sent'? '🛫'
                :message.status === 'received' ? '📦'
                :'👁‍🗨'}
                </span>
            {/if}
        </div>
    </div>
</div>

<style>
.wrap{
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-bottom: .5rem;
}

.wrap.right{
    justify-content: flex-end;
}

.msg{
    display: grid;
    grid-template-rows: 1fr auto;
    background-color: wheat;
    max-width: 70%;
    padding: 0 .5rem;
    border-radius: .25rem;
    overflow: hidden;
}

.right .msg{
    background-color: aquamarine;
}

img{
    width: calc(100% - 1rem);
    height: auto;
    margin: 1rem .5rem;
}

.msg div{
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: .25rem;
    gap: 1rem;
}

p{
    hyphens: auto;
    word-break: break-all;
}
</style>