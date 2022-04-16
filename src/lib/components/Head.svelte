<div class="header">
    <strong>
        <slot>
        <a href="/chat" aria-label="back" title="back">
        <svg height="30px" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 300.003 300.003" style="enable-background:new 0 0 300.003 300.003;" xml:space="preserve">
            <g>
                <g>
                    <path d="M150,0C67.159,0,0.001,67.159,0.001,150c0,82.838,67.157,150.003,149.997,150.003S300.002,232.838,300.002,150    C300.002,67.159,232.839,0,150,0z M189.226,218.202c-2.736,2.734-6.321,4.101-9.902,4.101c-3.582,0-7.169-1.367-9.902-4.103    l-56.295-56.292c-0.838-0.537-1.639-1.154-2.368-1.886c-2.796-2.799-4.145-6.479-4.077-10.144    c-0.065-3.667,1.281-7.35,4.077-10.146c0.734-0.731,1.53-1.349,2.368-1.886l56.043-56.043c5.47-5.465,14.34-5.467,19.808,0.003    c5.47,5.467,5.47,14.335,0,19.808l-48.265,48.265l48.514,48.516C194.695,203.864,194.695,212.732,189.226,218.202z"/>
                </g>
            </g>
            <g>
            </g>
            <g>
            </g>
            <g>
            </g>
            <g>
            </g>
            <g>
            </g>
            <g>
            </g>
            <g>
            </g>
            <g>
            </g>
            <g>
            </g>
            <g>
            </g>
            <g>
            </g>
            <g>
            </g>
            <g>
            </g>
            <g>
            </g>
            <g>
            </g>
            </svg>
    </a>
</slot>
</strong>
    <div>
        <a href="/settings" title="settings">Settings</a>
        <a href="/search" title="search">Search</a>
    </div>
</div>

<style>
        a{
        text-decoration: none;
        color: inherit;
    }

    .header{
        display: flex;
        height: 50px;
        padding: .5rem .5rem;
        background-color: blueviolet;
        color: white;
        align-items: center;
        font-size: 1.4rem;
    }

    .header div{
        display: flex;
        padding-right: .5rem;
        flex-direction: row-reverse;
        gap: 1rem;
        flex-grow: 1;
    }

    svg{
        fill: white;
        vertical-align: bottom;
    }
</style>