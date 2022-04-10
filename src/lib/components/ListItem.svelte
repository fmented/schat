<script lang="ts">
    export let img:string
    export let text:string|{strong:string, small:string}
    
</script>

<div class="item" on:click>
    <img src={img} alt="avatar">
    <div class="txt">
        {#if typeof text === 'string'}
            {#if text.startsWith('data:image')}
                📷 a picture
                {:else}
                <strong>{text}</strong>
            {/if}
            {:else}
            <strong>{text.strong}</strong>
            <small><em>{text.small}</em></small>
        {/if}
    </div>
</div>

<style>
    .item{
        display: grid;
        grid-template-columns: 50px 1fr;
        height: 50px;
        gap: .5rem;
    }

    img{
        height: 50px;
        width: 50px;
    }


    .txt{
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        text-align: right;
        font-size: 1.2rem;
        overflow: hidden;
    }

</style>