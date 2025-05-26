<script>
// @ts-nocheck
    import { fly } from 'svelte/transition';
    import { onMount } from 'svelte';
    import RangeSlider from 'svelte-range-slider-pips';
    import translations from './langs.json';
    import { elasticOut } from 'svelte/easing';

    let data = $state({
        seats: 40,
        occupation: 25,
        daysOpen: 23,
        aov: 50,             // Average Order Value
        timeStay: 60,
        open: [11, 16],
        margin: 15
    });

    let lang = $state(navigator.language.split('-').shift());
    let trans = $derived(translations[lang] || translations.en);
    let langList = { pt: 'Português', en: 'English', es: 'Español', fr: 'Français', de: 'Deutsch', it: 'Italiano' }
    let availLangs = $state([]);
    let showMenu = $state(false);
    let mode = $state(0);
    let timeHandle = 0;
    let clipImg = $state();
    let okClipImg;

    let results = $derived.by(() => {
		let numpeople = (data.seats * data.occupation) / 100;
		let staytimes = Math.round(((data.open[1] - data.open[0]) * 60) / data.timeStay);

		let meals = (numpeople * staytimes);
		let dailySales = meals * data.aov;
		let gross = dailySales * data.daysOpen;

        return {
            meals: meals.toFixed(0),
            dailySales: fmt(dailySales),
            monthlySales: fmt(dailySales * data.daysOpen),
            estimatedProfit: fmt(data.margin / 100 * gross)
        }
    });

    changeBkg();

    onMount(() => {
        addEventListener("orientationchange", changeBkg);
        changeImage();

        okClipImg = new Image();
        okClipImg.src = 'img/ok.png';

        availLangs = Object.keys(translations).map(t => ({ code: t, name: langList[t]}));
        console.log(availLangs)
    });

    function fmt(val) {
        return '$ ' + new Intl.NumberFormat(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val)
    }

    function changeBkg() { 
        let imgs = 8;
        let chosen = Math.floor(Math.random() * (imgs - 1)) + 1;
        let folder = screen.orientation.type.includes('lands') ? 'horz' : 'vert';
        let url = `img/${folder}/${chosen}.webp`;

        let img = new Image();
        img.onload = (e) => {
            document.body.style.backgroundImage = `url(${url})`;
        }
        img.src = url;
    }

    function rand(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    function changeImage() {
        let time = rand(60000, 160000); console.log(time)

        if (timeHandle) { 
            clearTimeout(timeHandle);
        }
        timeHandle = setTimeout(() => {
            changeBkg();
            changeImage();
        }, time);
    }

    function ctxMenu(evt) {
        evt.stopPropagation();
        showMenu = !showMenu;
    }

    function changeLang(newLang) {
        lang = newLang.code;
    }

    function copy() {
        let eol = getEOL();
        let txt = 'RESTAURATEUR' + eol;
        txt +=    '------------' + eol;
        txt += trans.proj + eol + eol;
        txt += trans.maxseats + ': ' + data.seats + eol;
        txt += trans.occupation + ': ' + data.occupation + eol;
        txt += trans.daysopen + ': ' + data.daysOpen + eol;
        txt += trans.aov + ': ' + data.aov + eol;
        txt += trans.avgstay + ': ' + data.timeStay + eol;
        txt += trans.workhours + ': ' + data.open + eol;
        txt += trans.profitmargin + ': ' + data.margin + eol;
        txt += '_________________________________________________' + eol + eol;
                
        txt += trans.mealsday + ': ' + results.meals + eol;
        txt += trans.dayrev + ': ' + results.dailySales + eol;
        txt += trans.monthrev + ': ' + results.monthlySales + eol;
        txt += trans.estprofit + ': ' + results.estimatedProfit + eol;
        
        copyToClipboard(txt);
    }

    function getEOL() {
        if(navigator.userAgent.indexOf('Windows') != -1) {
            return '\r\n';
        }
        return '\n';
    }

    function copyToClipboard(text) {
        if (window.clipboardData && window.clipboardData.setData) {
            // Internet Explorer-specific code path to prevent textarea being shown while dialog is visible.
            return window.clipboardData.setData("Text", text);

        }
        else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
            var textarea = document.createElement("textarea");
            textarea.textContent = text;
            textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in Microsoft Edge.
            document.body.appendChild(textarea);
            textarea.select();
            try {
                return document.execCommand("copy");  // Security exception may be thrown by some browsers.
            }
            catch (ex) {
                console.warn("Copy to clipboard failed.", ex);
                return prompt("Copy to clipboard: Ctrl+C, Enter", text);
            }
            finally {
                document.body.removeChild(textarea);
                clipImg.src = okClipImg.src;
                clipImg.style.pointerEvents = 'none';

                setTimeout(() => {
                    clipImg.src = 'img/copy.png';
                    clipImg.style.pointerEvents = 'all';
                }, 3000);
            }
        }
    }

    function sendMail() {
        window.location.href = 'mailto:walter@synergys.com.br';
    }

    function bmc() {
        window.open('https://buymeacoffee.com/wstaeblein', '_blank');
    }
</script>

<svelte:body onclick={() => showMenu = false } />

<main>
    <h1>Restaurateur</h1>
    <h2>{trans.proj}</h2>

    {#if mode == 0}
        <div class="results" in:fly={{ y: 200 }}>
            <div class="cards">
                <div>
                    <img src="img/meals.png" alt="" />
                    <h5>{trans.mealsday}</h5>
                    <span></span>
                    <h4>{results.meals || '---'}</h4>
                </div>
                <div>
                    <img src="img/dayrevenue.png" alt="" />
                    <h5>{trans.dayrev}</h5>
                    <span></span>
                    <h4>{results.dailySales || '---'}</h4>
                </div>
                <div>
                    <img src="img/monthrevenue.png" alt="" />
                    <h5>{trans.monthrev}</h5>
                    <span></span>
                    <h4>{results.monthlySales || '---'}</h4>
                </div>
                <div>
                    <img src="img/estimatedprofit.png" alt="" />
                    <h5>{trans.estprofit}</h5>
                    <span></span>
                    <h4>{results.estimatedProfit || '---'}</h4>
                </div>            
            </div>

            <nav>
                <div>
                    <span>{trans.maxseats}</span>
                    <span>
                        <span>
                            <RangeSlider bind:value={data.seats} min={4} max={320} range="min" />
                        </span>
                        <span>{data.seats}</span>                        
                    </span>
                </div>
                <div>
                    <span>{trans.occupation}</span>
                    <span>
                        <span>
                            <RangeSlider bind:value={data.occupation} range="min" />
                        </span>
                        <span>{data.occupation}%</span>                        
                    </span>
                </div>
                <div>
                    <span>{trans.daysopen}</span>
                    <span>
                        <span>
                            <RangeSlider bind:value={data.daysOpen} min={1} max={30} range="min" />
                        </span>
                        <span>{data.daysOpen} {data.daysOpen == 1 ? trans.day : trans.days}</span>                      
                    </span>
                </div>
                <div>
                    <span>{trans.aov}</span>
                    <span>
                        <span>
                            <RangeSlider bind:value={data.aov} min={5} max={500} range="min" />
                        </span>
                        <span>{fmt(data.aov)}</span>                      
                    </span>
                </div>
                <div>
                    <span>{trans.avgstay}</span>
                    <span>
                        <span>
                            <RangeSlider bind:value={data.timeStay} min={5} max={600} range="min" />
                        </span>
                        <span>{data.timeStay} Min</span>                      
                    </span>
                </div>
                <div>
                    <span>{trans.workhours}</span>
                    <span>
                        <span>
                            <RangeSlider bind:values={data.open} min={0} max={23} range="true" />
                        </span>
                        <span>{data.open[0]}h a {data.open[1]}h</span>                    
                    </span>
                </div>   
                <div>
                    <span>{trans.profitmargin}</span>
                    <span>
                        <span>
                            <RangeSlider bind:value={data.margin} range="min" />
                        </span>
                        <span>{data.margin}%</span>                    
                    </span>                
                </div>   
            </nav>

            <footer>
                <button class="ctxmenu narrow" onclick={ctxMenu}>
                    <img src="img/flags/{lang}.png" alt="" />
                    <menu class:show={showMenu}>
                        {#each availLangs as ll}
                            <!-- svelte-ignore a11y_click_events_have_key_events -->
                            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                            <li onclick={changeLang.bind(this, ll)}>
                                <img src="img/flags/{ll.code}.png" alt="{ll.name}" />
                                <span>{ll.name}</span>
                            </li>
                        {/each}
                        </menu>
                </button>
                <button onclick={copy} class="shadow"><img src="img/copy.png" bind:this={clipImg} alt="{trans.copy}" /></button>
                <button onclick={() => mode = 1} class="shadow"><img src="img/info.png" alt="{trans.about}" /></button>
                <button onclick={bmc} class="shadow"><img src="img/bmc.png" alt="{trans.bmc}" /></button>
                <button onclick={sendMail} class="shadow"><img src="img/email.png" alt="{trans.contact}" /></button>
            </footer>        
        </div>
    {:else}
        <aside in:fly={{ y: 200 }}>
            <p class="pitch">{trans.pitch}</p>
            <p>{trans.withlove}</p>
            <ul>
                <li>
                    <a href="mailto:walter@synergys.com.br" target="_blank"><img src="img/at.png" alt="Email" /></a>
                </li>
                <li>
                    <a href="https://github.com/wstaeblein" target="_blank"><img src="img/github.png" alt="Github" /></a>
                </li>
                <li>
                    <a href="https://www.linkedin.com/in/wstaeblein" target="_blank"><img src="img/linkedin.png" alt="Linkedin" /></a>
                </li>         
                <li>
                    <a href="https://bsky.app/profile/wstaeblein.bsky.social" target="_blank"><img src="img/bsky.png" alt="Blue Sky" /></a>
                </li>         
                <li>
                    <a href="https://facebook.com/wstaeblein" target="_blank"><img src="img/fb.png" alt="Facebook" /></a>
                </li>                               
            </ul>
            <div>
                <img src="img/bmc_qr.png" style="height: 160px" alt="qrcode" />
                <div><a href="https://buymeacoffee.com/wstaeblein" target="_blank"><b>{trans.bmc}</b></a></div>
            </div>

            <p>{trans.sitesdesc}</p>
            <ul class="sites">
                {#each trans.sites as site}
                    <li>
                        <a href={site.link} target="_blank">

                            <div><img src="img/sites/{site.id}.png" alt="{site.name}" /></div>
                            <div class="desc">{site.desc}</div>
                        </a>
                    </li>
                {/each}
            </ul>
            <footer>
                <button onclick={() => mode = 0} class="shadow">{trans.back}</button>
            </footer>
        </aside>
    {/if}
</main>

<style>
    .pitch {
        font-size: smaller;
        text-align: justify;
    }

    aside {
        text-align: center;
        user-select: none;
    }

    aside ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        justify-content: center;
        gap: 15px;
        margin: 5px 0 20px;
    }

    aside ul.sites {
        flex-wrap: wrap;
        justify-content: flex-start;
    }

    aside ul > li > a {
        transition: transform 0.3s ease;
        display: inline-block;
    }

    aside ul.sites > li {
        width: 32%;
        border: 1px dotted #250a0a;
        padding: 0 10px 10px;
        border-radius: 9px;
    }

    aside ul.sites > li > a {
        transition: transform 0.3s ease;
        display: inline-block;
        text-decoration: none;
    }

    aside ul.sites > li > a:hover {
        color: inherit;
        text-shadow: none;
    }

    aside ul.sites > li > a img {
        height: 92px;
        transition: transform 0.3s ease;
    }

    aside ul.sites > li:hover > a img {
        transform: scale(1.2);
    }

    aside ul:not(.sites) > li > a:hover {
        transform: scale(1.2);
    }

    aside ul > li > a > img {
        height: 32px;
    }

    aside ul > li .desc {
        font-size: 12px;
        margin-top: -10px;
    }

    .ctxmenu {
        position: relative;

    }

    .ctxmenu > menu {
        position: absolute;
        background-color: #f0ac46;
        color: #250a0a;
        font-size: 14px;
        text-shadow: none;
        bottom: 100%;
        left: 0;
        padding: 10px;
        border-radius: 7px;
        text-transform: none;
        transform: scale(0);
        transform-origin: bottom left;
        transition: transform 0.3s ease;
        filter: drop-shadow(3px 3px 5px rgba(0, 0, 0, .8));
        z-index: 13;
    }

    .ctxmenu > menu::after {
        content: '';
        position: absolute;
        width: 0px;
        height: 0px;
        left: 10px;
        bottom: -10px;
        border-style: solid;
        border-width: 17.3px 10px 0 10px;
        border-color: #f0ac46 transparent transparent transparent;
        transform: rotate(0deg);
    }

    .ctxmenu > menu.show {
        transform: scale(1);
    }

    .ctxmenu > menu > li {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 8px;
        transition: all 0.4s ease;
        border-radius: 6px;
        user-select: none;
    }

    .ctxmenu > menu > li:hover {
        background-color: orangered;
        color: #fff;
    }

    .ctxmenu > menu > li img {
        height: 16px;
    }
    
    .results > div.cards {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        flex-wrap: wrap;
        justify-content: space-evenly;
        gap: 10px;
    }

    .results > div.cards > div {
        background-color: #f0ac4666;
        padding: 10px;
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        user-select: none;
    }

    .results > div.cards > div > img {
        width: 40%;
        object-fit: contain;
        align-self: center;
    }

    .results > div.cards > div > span {
        flex-grow: 1;
    }

    h5 {
        margin: 0;
        color: brown;
        text-align: center;
    }

    h4 {
        font-family: "Oswald", sans-serif;
        font-optical-sizing: auto;
        font-style: normal;
        font-weight: normal;
        margin: 0;
        font-size: 16px;
        background-color: #125919;         /* #752001 */
        border-radius: 7px;
        margin-top: 8px;
        color: #fff;
        text-align: center;
        white-space: nowrap;
        padding: 0 0 1px 0;
    }    

    nav {
        margin-top: 15px;
        width: 100%;
        --range-slider: #f0ac46;
        --range-handle: rgb(97, 51, 51);
        --range-handle-inactive: rgb(97, 51, 51);
        --range-handle-focus: rgb(97, 51, 51);
    }

    nav > div {
        display: flex;
        gap: 10px;
        align-items: center;
        border-bottom: 1px dotted #615f5f;
        padding-bottom: 5px;
        margin-bottom: 5px;
    }

    nav > div > span:first-child {
        width: calc(45% - 10px);
        user-select: none;
    }

    nav > div > span:last-child {
        width: 55%;
        display: flex;
        align-items: center;
        gap: 10px;
    }

    nav > div > span:last-child > span:first-child {
        flex-grow: 1;
    }

    nav > div > span:last-child > span:last-child {
        width: 70px;
        text-align: right;
        user-select: none;
    }

    footer {
        margin-top: 15px;
        display: flex;
        justify-content: center;
        gap: 10px;
    }

    button > img {
        height: 26px;
    }

    button.narrow {
        padding: 5px;
    }

    @media screen and (max-width: 640px) {
        nav {
            font-size: smaller;
        }

        nav > div {
            flex-direction: column;
        }

        nav > div > span {
            width: 100% !important;
        }

        nav > div > span:last-child > span:last-child {
            width: 60px;
        }

        h5 {
            font-size: 12px;
        }

        h4 {
            font-size: 12px;
            padding: 2px 0;
        }

        .results > div.cards {
            grid-template-columns: repeat(2, 1fr);
        }

        .results > div.cards > div > img {
            width: 44px;
        }
    }

    @media screen and (max-width: 480px) {
        main {
            padding: 0 10px 10px;
            margin: 1em;
        }

        nav > div > span {
            gap: 0 !important;
        }
        
        .results > div.cards > div > img {
            width: 36px;
        }
    }

    @media screen and (max-width: 380px) {
        main {
            padding: 0 10px 10px;
            margin: 0.3em;
        }
    }
</style>
