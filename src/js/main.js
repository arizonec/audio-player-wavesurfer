import '../index.html';
import '../assets/styles/style.scss';
import data from './audioData.js';
import { toMinutes } from './timer';
import { shuffle } from './shuffle';
import variables from './variables';
import WaveSurfer from 'wavesurfer.js';

const { audioList, currentItem, repeatButton, volumeButton, shuffleButton } = variables;

const state = {
    audios: [],
    current: {},
    repeating: false,
    playing: false,
}
let playButton = null;

const render = () => {
    renderAudios();
}

let waveElem = '';

const renderWave = (src) => {
    waveElem = WaveSurfer.create({
        container: document.querySelector('.progress-current'),
        waveColor: 'violet',
        progressColor: 'purple',
        barWidth: 0.3,
        barHeight: 0,
        responsive: true,
    });

    waveElem.load(String(src));
}

const handleShuffle = () => {
    const { children } = audioList;
    const suffled = shuffle([...children]);

    audioList.innerHTML = ' ';
    suffled.forEach((item) => audioList.appendChild(item));
};

const handleVolume = ({ target: { value } }) => {
    const { current } = state;

    state.volume = value;

    if (!current?.audio) return;

    // current.audio.volume = value;
};

const handleRepeat = ({ currentTarget }) => {
    const { repeating } = state;

    currentTarget.classList.toggle('active', !repeating);
    state.repeating = !repeating;
};

const handleAudioPlay = () => {
    const { playing, current } = state;
    const { audio } = current;

    if (!playing) {
        audio.play();
        waveElem.play();
    } else {
        audio.pause();
        waveElem.pause();
    }

    state.playing = !playing;

    playButton.classList.toggle('playing', !playing);
};

const handleNext = () => {
    const { current } = state;
    const currentItem = document.querySelector(`[data-id="${current.id}"]`);
    const next = currentItem.nextSibling?.dataset;
    const first = audioList.firstElementChild?.dataset;

    const itemId = next?.id || first?.id;

    if (!itemId) return;

    setCurrentItem(itemId);
};

const handlePrev = () => {
    const { current } = state;
    const currentItem = document.querySelector(`[data-id="${current.id}"]`);
    const prev = currentItem.previousSibling?.dataset;
    const last = audioList.lastElementChild?.dataset;

    const itemId = prev?.id || last?.id;

    if (!itemId) return;

    setCurrentItem(itemId);
};

const handlePlayer = () => {
    const play = document.querySelector('.controls-play');
    const next = document.querySelector('.controls-next');
    const prev = document.querySelector('.controls-prev');

    play.addEventListener('click', handleAudioPlay);
    next.addEventListener('click', handleNext);
    prev.addEventListener('click', handlePrev);

    playButton = play;
};

const audioUpdatehandler = ({ audio, duration }) => {
    const progress = document.querySelector('.progress-current');
    const timeline = document.querySelector('.timeline-start');

    audio.addEventListener('timeupdate', ({ target }) => {
        const { currentTime } = target;

        timeline.innerHTML = toMinutes(currentTime);
        progress.style.width = `100%`;
    });

    audio.addEventListener('ended', ({ target }) => {
        target.currentTime = 0;
        progress.style.width = `0%`;

        state.repeating ? target.play() : handleNext();
    })
};

const renderCurrentItem = ({ link, track, group, duration, year, audio }) => {
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

const pauseCurrentAudio = () => {
    const { current: { audio } } = state;

    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
};

const togglePlaying = () => {
    const { playing, current } = state;
    const { audio } = current;

    if (playing) {
        // audio.play();
        waveElem.play();
    } else {
        // audio.pause();
        waveElem.pause();
    }
    playButton.classList.toggle('playing', playing);
};

const setCurrentItem = (itemId) => {
    const current = state.audios.find(({ id }) => +id === +itemId);

    if (!current) return;

    pauseCurrentAudio();

    state.current = current;

    currentItem.innerHTML = renderCurrentItem(current);

    renderWave(require(`../assets/audio/${current.link}`))

    audioUpdatehandler(current);

    handlePlayer();

    setTimeout(() => {
        togglePlaying();
    }, 10);
};

const handleItem = ({ target }) => {
    const { id } = target.dataset;

    if (!id) return;

    setCurrentItem(id);
};

const renderItem = ({ id, link, track, group, genre, duration }) => {
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

const loadAudioData = (audio) => {
    audioList.innerHTML += renderItem(audio);
};

const renderAudios = () => {
    data.forEach((item) => {
        const audio = new Audio(require(`../assets/audio/${item.link}`));

        audio.addEventListener('loadeddata', () => {
            const newItem = { ...item, duration: audio.duration, audio };
            state.audios = [...state.audios, newItem];
            loadAudioData(newItem);
        })
    })
};

audioList.addEventListener('click', handleItem);
repeatButton.addEventListener('click', handleRepeat);
volumeButton.addEventListener('change', handleVolume);
shuffleButton.addEventListener('click', handleShuffle);

render();