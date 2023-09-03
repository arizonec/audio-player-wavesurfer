import '../index.html';
import '../assets/styles/style.scss';
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
}

const render = () => {
    renderAudios();
}

const renderAudios = () => {
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

    // pauseCurrentAudio();

    state.current = current;

    currentItem.innerHTML = renderCurrentItem(current);

    renderWave(require(`../assets/audio/${current.link}`))

    audioUpdatehandler(current);

    handlePlayer();

    // setTimeout(() => {
    //     togglePlaying();
    // }, 10);
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
                <span class="timeline-end">${toMinutes(duration)}</span>
            </div>
            </div>
            </div>
            </div>`;
};

audioList.addEventListener('click', handleItem);

const handlePlayer = () => {
    const play = document.querySelector('.controls-play');
    const next = document.querySelector('.controls-next');
    const prev = document.querySelector('.controls-prev');

    play.addEventListener('click', () => waveElem.play());
    // next.addEventListener('click', handleNext);
    // prev.addEventListener('click', handlePrev);

    playButton = play;
};

const audioUpdatehandler = ({ audio }) => {
    const timeline = document.querySelector('.timeline-start');

    audio.addEventListener('timeupdate', ({ target }) => {
        timeline.innerHTML = toMinutes(target.currentTime);
    });

    waveElem.on('finish', ({ target }) => {
        target.currentTime = 0;

        state.repeating ? target.play() : handleNext();
    })
};

render();

