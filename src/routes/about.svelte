<div>
    <a href="/"><strong>schat</strong></a>
</div>

<h1>About</h1>

<details>
    <summary>
        What is this?
    </summary>
    <p>this is a simple chat app that uses combination of web technologies such as IndexedDB, Web Push, and Service Worker.</p>
</details>

<details>
    <summary>
        What does it mean?
    </summary>
    <p>it means that you can chat with your friends without having to install any app, but since it's a progessive web app it's recommended to install it so the service worker can run as expected in the background.  </p>
</details>


<details>
    <summary>
        What does subscribe mean?
    </summary>
    <p>it means we will collect a few required data like endpoint and public keys for web push to work.</p>
</details>

<details>
    <summary>
        Do I need a unique nickname?
    </summary>
    <p>No. nickname is only used so that other people can find your account, but make sure it's unique enough so your account can be found easily</p>
</details>

<details>
    <summary>
        What about my chat data?
    </summary>
    <p>it is stored in your device.</p>
</details>

<details>
    <summary>
        Is my local chat data encrypted?
    </summary>
    <p>No. you can view it directly in your devtools. however, during sending process it will be encrypted as it is part of web push standards.</p>
</details>

<details>
    <summary>Why the website asking for notification permission?</summary>
    <p>it is required by Web Push API.</p>
</details>

<details>
    <summary>Why my device is making request in the background?
    </summary>
    <p>we use service worker to receive the incoming message and it will make request in the background to notify the sender that the message has been delivered. </p>
</details>

<details>
    <summary>
        What will happen when I logout?
    </summary>
    <p>we will clear your chat data and you will be logged out. your data cannot be recovered.</p>
</details>


<style>
    
    details {
        padding: .5rem;
    }

p{
    margin-left: 1rem;
}

summary{
    font-weight: 600;
    cursor: pointer;
}

a{
    text-decoration: none;
    color: inherit;
}

div{
        background-color: blueviolet;
        color: white;
        padding: 1rem .5rem;
        margin-bottom: .5rem;
        font-size: 1.4rem;
    }
</style>