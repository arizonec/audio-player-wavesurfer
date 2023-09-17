import '../index.html';
import '../assets/styles/style.css';
import data from './audioData.js';
import { toMinutes } from './timer';
import { shuffle } from './shuffle';
import variables from './variables';
import WaveSurfer from 'wavesurfer.js';

const { audioList, currentItem, repeatButton, volumeButton, shuffleButton } = variables;

let playButton = null;
let waveElem = '';

const state = {
    audios: [],
    current: {},
    repeating: false,
    playing: false,
}

const renderWave = (src) => {
    waveElem = WaveSurfer.create({
        container: document.querySelector('.progress-current'),
        waveColor: 'violet',
        progressColor: 'purple',
        barWidth: 0.3,
        barHeight: 1,
        responsive: true,
        url: src,
    });

    waveElem.on('ready', () => {
        const duration = waveElem.getDuration();
        const timelineStart = document.querySelector('.timeline-start');
        const timelineEnd = document.querySelector('.timeline-end');
        timelineEnd.textContent = toMinutes(duration);

        setInterval(() => {
            const currentTime = waveElem.getCurrentTime();
            timelineStart.textContent = toMinutes(currentTime)
        }, 1000);
    });

    waveElem.on('finish', () => {
        state.repeating ? waveElem.play() : setNext();
    })

    const volumeSlider = document.querySelector('.contols-volume');
    const setVolume = () => {
        waveElem.setVolume(volumeSlider.value);
    };

    setVolume();

    volumeSlider.addEventListener('input', setVolume);
}

const render = () => {
    renderAudios(data);
}





const renderAudios = (data) => {
    if (localStorage.length > 0) {
        for (let i = 0; i < localStorage.length; i++) {
            let key = localStorage.key(i);
            let item = JSON.parse(localStorage.getItem(key));
            state.audios = [...state.audios, item];
            loadAudioData(item);
        }
    } else {
        data.forEach((item) => {
            const audio = new Audio(require(`../assets/audio/${item.link}`));

            audio.addEventListener('loadeddata', () => {
                const newItem = { ...item, duration: audio.duration, audio };
                localStorage.setItem(newItem.id, JSON.stringify(newItem));
                state.audios = [...state.audios, newItem];
                loadAudioData(newItem);
            })
        })
    }
};

const loadAudioData = (audio) => {
    audioList.innerHTML += renderItem(audio);
};

const renderItem = ({ id, link, track, group, duration }) => {
    console.log(link)
    const [image] = link.split('.');
    return `<div class="item" data-id="${id}">
    <div class="item-image">
        <img src="${require(`../assets/img/${image}.png`)}" alt="">
    </div>
    <div class="item-titles">
        <h2 class="item-group">${group}</h2>
        <h3 class="item-track">${track}</h3>
    </div>
    <p class="item-duration">${toMinutes(duration)}</p>

    <button class="item-play">
        <img src="${require(`../assets/img/play.svg`)}"  class="icon-play">
    </button>
</div>`;
};

const handleItem = ({ target }) => {
    const { id } = target.dataset;

    if (!id) return;

    setCurrentItem(id);
};

const setCurrentItem = (itemId) => {
    const current = state.audios.find(({ id }) => +id === +itemId);

    if (!current) return;

    state.current = current;

    currentItem.innerHTML = renderCurrentItem(current);

    renderWave(require(`../assets/audio/${current.link}`))

    playerManage();
};

const renderCurrentItem = ({ link, track, group, duration, year }) => {
    const [image] = link.split('.');

    return `<div class="current-image">
                <img src="${require(`../assets/img/${image}.png`)}" alt="">
            </div>
            <div class="current-info">
                <div class="current-info__top">
                    <div class="current-info__titles">
                        <h2 class="current-info__group">${group}</h2>
                        <h3 class="current-info__track">${track}</h3>
                    </div>
                <div class="current-info__year">${year}</div>
            </div>
            <div class="controls">
                <div class="controls-buttons">
                    <button class="contols-button controls-prev">
                        <img src="${require(`../assets/img/arrow.svg`)}"  class="icon-arrow">
                    </button>
                    <button class="contols-button controls-play">
                        <img src="${require(`../assets/img/pause.svg`)}"  class="icon-pause">
                        <img src="${require(`../assets/img/play.svg`)}"  class="icon-play">
                    </button>
                    <button class="contols-button controls-next">
                        <img src="${require(`../assets/img/arrow.svg`)}"  class="icon-arrow">
                    </button>
                </div>
                <div class="controls-progress">
                <div class="progress">
                <div class="progress-current"></div>
            </div>
            <div class="timeline">
                <span class="timeline-start">00:00</span>
                <span class="timeline-end">00:00</span>
            </div>
            </div>
            </div>
            </div>`;
};

const playerManage = () => {
    const play = document.querySelector('.controls-play');
    const next = document.querySelector('.controls-next');
    const prev = document.querySelector('.controls-prev');

    play.addEventListener('click', handleAudioPlay);
    next.addEventListener('click', setNext);
    prev.addEventListener('click', setPrev);

    playButton = play;
};

const handleAudioPlay = () => {
    const { playing } = state;

    if (!playing) {
        waveElem.play();
    } else {
        waveElem.pause();
    }

    state.playing = !playing;

    playButton.classList.toggle('playing', !playing);
};

const setNext = () => {
    const { current } = state;
    const currentItem = document.querySelector(`[data-id="${current.id}"]`);
    const next = currentItem.nextSibling?.dataset;
    const first = audioList.firstElementChild?.dataset;

    const itemId = next?.id || first?.id;

    if (!itemId) return;

    setCurrentItem(itemId);
};

const setPrev = () => {
    const { current } = state;
    const currentItem = document.querySelector(`[data-id="${current.id}"]`);
    const prev = currentItem.previousSibling?.dataset;
    const last = audioList.lastElementChild?.dataset;

    const itemId = prev?.id || last?.id;

    if (!itemId) return;

    setCurrentItem(itemId);
};

const setRepeat = ({ currentTarget }) => {
    const { repeating } = state;

    currentTarget.classList.toggle('active', !repeating);
    document.querySelector('.icon-repeat').classList.toggle('active');
    state.repeating = !repeating;
};

const setShuffle = () => {
    const { children } = audioList;
    const suffled = shuffle([...children]);

    audioList.innerHTML = ' ';
    suffled.forEach((item) => audioList.appendChild(item));
};


audioList.addEventListener('click', handleItem);
repeatButton.addEventListener('click', setRepeat);
shuffleButton.addEventListener('click', setShuffle);

render();

