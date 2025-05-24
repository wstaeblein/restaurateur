<script>
    import { onMount } from 'svelte';
    import RangeSlider from 'svelte-range-slider-pips';
    import translations from './langs.json';

    let data = $state({
        seats: 40,
        occupation: 25,
        daysOpen: 23,
        aov: 50,             // Average Order Value
        timeStay: 60,
        open: [11, 16],
        margin: 15
    });

    let lang = $state(navigator.language.split('-').shift())
    let trans = $derived(translations[lang] || translations.en);
    let langList = { pt: 'Português', en: 'English', es: 'Español', fr: 'Français', de: 'Deutsch', it: 'Italiano' }
    let availLangs = $state([]);
    let showMenu = $state(false);

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
        setTimeout(() => {
            changeBkg();
            changeImage();
        }, time);
    }

    function ctxMenu(evt) {
        evt.stopPropagation();
        showMenu = !showMenu;
    }

</script>

<svelte:body onclick={() => showMenu = false } />

<main>
    <h1>Restaurateur</h1>
    <h2>{trans.proj}</h2>

    <div class="results">
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
                        <RangeSlider bind:value={data.seats} min={4} max={500} />
                    </span>
                    <span>{data.seats}</span>                        
                </span>
            </div>
            <div>
                <span>{trans.occupation}</span>
                <span>
                    <span>
                        <RangeSlider bind:value={data.occupation} />
                    </span>
                    <span>{data.occupation}%</span>                        
                </span>
            </div>
            <div>
                <span>{trans.workaysmonth}</span>
                <span>
                    <span>
                        <RangeSlider bind:value={data.daysOpen} min={1} max={30} />
                    </span>
                    <span>{data.daysOpen} Dias</span>                      
                </span>
            </div>
            <div>
                <span>{trans.aov}</span>
                <span>
                    <span>
                        <RangeSlider bind:value={data.aov} min={5} max={500}  />
                    </span>
                    <span>{fmt(data.aov)}</span>                      
                </span>
            </div>
            <div>
                <span>{trans.avgstay}</span>
                <span>
                    <span>
                        <RangeSlider bind:value={data.timeStay} min={5} max={600} />
                    </span>
                    <span>{data.timeStay} Min</span>                      
                </span>
            </div>
            <div>
                <span>{trans.workhours}</span>
                <span>
                    <span>
                        <RangeSlider bind:values={data.open} min={0} max={23} range={true} />
                    </span>
                    <span>{data.open[0]}h a {data.open[1]}h</span>                    
                </span>
            </div>   
            <div>
                <span>{trans.profitmargin}</span>
                <span>
                    <span>
                        <RangeSlider bind:value={data.margin} />
                    </span>
                    <span>{data.margin}%</span>                    
                </span>                
            </div>   
        </nav>
    </div>
    <footer>
        <button class="ctxmenu" onclick={ctxMenu}>
            <img src="img/flags/{lang}.png" alt="" />
            <ul class:show={showMenu}>
                {#each availLangs as ll}
                    <li>
                        <img src="img/flags/{ll.code}.png" alt="{ll.name}" />
                        <span>{ll.name}</span>
                    </li>
                {/each}
            </ul>
        </button>
        <button>{trans.copy}</button>
        <button>{trans.about}</button>
        <button>{trans.contact}</button>
    </footer>
</main>

<style>
    .ctxmenu {
        position: relative;

    }

    .ctxmenu > ul {
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
    }

    .ctxmenu > ul.show {
        transform: scale(1);
    }

    .ctxmenu > ul > li {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 0;
    }

    .ctxmenu > ul > li img {
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
    }

    footer {
        margin-top: 15px;
        display: flex;
        justify-content: center;
        gap: 10px;
    }

    button > img {
        height: 14px;
    }

    @media screen and (max-width: 640px) {
        nav > div {
            flex-direction: column;
        }

        nav > div > span {
            width: 100% !important;
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
    }

    @media screen and (max-width: 480px) {
        main {
            padding: 0 10px 10px;
            margin: 1em;
        }

        nav {
            font-size: smaller;
        }
    }

    @media screen and (max-width: 380px) {
        main {
            padding: 0 10px 10px;
            margin: 0.3em;
        }
    }
</style>
