<script lang="ts">
    import type {Chat} from 'interfaces'
    import {session} from '$app/stores'
    export let message:Chat
</script>

<div class="wrap" class:right={message.from === $session.user}>
    <div class="msg">
        {#if message.content.startsWith('data:image')}
        <img src={message.content} alt="unknown">
        {:else}
        <p>{message.content}</p>
        {/if}
        <div>
            <span>{new Date(message.timeStamp).getDate()} {new Date(message.timeStamp).getMonth()}
                @ {new Date(message.timeStamp).getHours()} : {new Date(message.timeStamp).getMinutes()}
            </span>
            {#if message.from === $session.user}
                <span>{
                message.status==='pending'?'⏱'
                :message.status === 'sending'? '📤'
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
}

.wrap.right{
    justify-content: flex-end;
}

.msg{
    display: grid;
    grid-template-rows: 1fr auto;
    background-color: aquamarine;
    max-width: 70%;
    padding: 0 .5rem;
    border-radius: .25rem;
    overflow: hidden;
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
    padding: .5rem;
}

p{
    hyphens: auto;
    word-break: break-all;
}
</style>