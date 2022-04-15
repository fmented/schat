<div>
    <slot/>
</div>

<style>
    div{
        display: grid;
        height: calc(100vh);
        grid-template-rows: auto 1fr auto;
        gap: .25rem;
        position: relative;
    }
</style>