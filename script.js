// Copyright year setting
var currentYear = new Date().getFullYear();
document.getElementById("year").innerHTML = currentYear;
document.getElementById("year2").innerHTML = currentYear;

const TYPES = [
"normal","fighting","flying","poison","ground","rock","bug","ghost","steel",
"fire","water","grass","electric","psychic","ice","dragon","dark","fairy"
];

function cap(s){
    return s.charAt(0).toUpperCase() + s.slice(1);
}

/* =========================
   TYPE CHARTS
   ========================= */

const WeakChart = {
    normal: ['fighting'], 
    fighting: ['flying','psychic','fairy'], 
    flying: ['electric','ice','rock'],
    poison: ['ground','psychic'], 
    ground: ['water','ice','grass'],
    rock: ['water','grass','fighting','ground','steel'], 
    bug: ['flying','rock','fire'],
    ghost: ['ghost','dark'], 
    steel: ['fighting','ground','fire'],
    fire: ['water','rock','ground'], 
    water: ['electric','grass'],
    grass: ['flying','poison','bug','fire','ice'], 
    electric: ['ground'],
    psychic: ['bug','ghost','dark'], 
    ice: ['fighting','rock','steel','fire'],
    dragon: ['ice','dragon','fairy'], 
    dark: ['fighting','bug','fairy'],
    fairy: ['poison','steel']
};

const ResisChart = {
    normal: [], 
    fighting: ['rock','bug','dark'], 
    flying: ['fighting','bug','grass'],
    poison: ['fighting','poison','bug','grass','fairy'], 
    ground: ['poison','rock'],
    rock: ['normal','flying','poison','fire'], 
    bug: ['fighting','ground','grass'],
    ghost: ['poison','bug'], 
    steel: ['normal','flying','rock','bug','steel','grass','psychic','ice','dragon','fairy'],
    fire: ['bug','steel','fire','grass','ice','fairy'], 
    water: ['steel','fire','water','ice'],
    grass: ['ground','water','grass','electric'], 
    electric: ['flying','steel','electric'],
    psychic: ['fighting','psychic'], 
    ice: ['ice'],
    dragon: ['fire','water','grass','electric'], 
    dark: ['ghost','dark'],
    fairy: ['fighting','bug','dark']
};

const ImmuneChart = {
    normal: ['ghost'], 
    flying: ['ground'], 
    ground: ['electric'],
    ghost: ['normal','fighting'], 
    steel: ['poison'],
    dark: ['psychic'], 
    fairy: ['dragon']
};

/* =========================
   STATE
   ========================= */

let streak = 0;
let correctAnswers = [];
let selected = new Set();

/* =========================
   EFFECT CALC
   ========================= */

function getEffect(att, def) {
    if (ImmuneChart[def]?.includes(att)) return 0;

    let mult = 1;
    if (WeakChart[def]?.includes(att)) mult *= 2;
    if (ResisChart[def]?.includes(att)) mult *= 0.5;

    return mult;
}

function calcDual(att, d1, d2) {
    return getEffect(att, d1) * getEffect(att, d2);
}

/* =========================
   GAME
   ========================= */

function startGame() {
    streak = 0;
    document.getElementById('popup').style.display = 'none';
    nextQuestion();
}

function nextQuestion() {
    selected.clear();
    document.getElementById('feedback').innerText = '';
    document.getElementById('streak').innerText = 'Streak: ' + streak;

    let d1 = TYPES[Math.floor(Math.random() * TYPES.length)];
    let isDual = Math.random() < 0.5;
    let d2 = null;
    if (isDual) {
        do {
            d2 = TYPES[Math.floor(Math.random() * TYPES.length)];
        } while (d2 === d1);
    }

    let targetMults = [4, 2, 0.5, 0.25, 0];
    let possible = {};

    for (let t of TYPES) {
        let val = isDual ? calcDual(t, d1, d2) : getEffect(t, d1);
        if (!possible[val]) possible[val] = [];
        possible[val].push(t);
    }

    let validMults = targetMults.filter(m => possible[m]);
    let chosenMult = validMults[Math.floor(Math.random() * validMults.length)];

    correctAnswers = possible[chosenMult];

    let qDiv = document.getElementById('question');
    qDiv.innerHTML = '';

    // create container for images
    let imgContainer = document.createElement('div');
    imgContainer.className = 'question-types';

    [d1, d2].filter(Boolean).forEach(t => {
        let img = document.createElement('img');
        img.src = `https://raw.githubusercontent.com/CajunAvenger/cajunavenger.github.io/main/types/${cap(t)}.png`;
        img.className = 'type-img';
        imgContainer.appendChild(img);
    });

    qDiv.appendChild(imgContainer);

    // text below images
    let text = document.createElement('div');
    text.innerText = `Pick ALL types that deal x${chosenMult}`;
    qDiv.appendChild(text);

    renderOptions();
}

function renderOptions() {
    let div = document.getElementById('types');
    div.innerHTML = '';

    TYPES.forEach(t => {
        let img = document.createElement('img');
        img.src = `https://raw.githubusercontent.com/CajunAvenger/cajunavenger.github.io/main/types/${cap(t)}.png`;
        img.className = 'type-img';

        img.onclick = () => {
            if (selected.has(t)) {
                selected.delete(t);
                img.classList.remove('selected');
            } else {
                selected.add(t);
                img.classList.add('selected');
            }
        };

        div.appendChild(img);
    });
}

function submitAnswer() {
    let correctSet = new Set(correctAnswers);
    let isCorrect = true;

    if (selected.size !== correctSet.size) isCorrect = false;

    selected.forEach(t => {
        if (!correctSet.has(t)) isCorrect = false;
    });

    const imgs = document.querySelectorAll('#types .type-img');

    if (isCorrect) {
        document.getElementById('feedback').innerText = '✅ Correct';

        correctAnswers.forEach(t => {
            const img = Array.from(imgs).find(i =>
                i.src.includes(`/${cap(t)}.png`)
            );

            if (img) {
                img.classList.add('correct');
            }
        });

        setTimeout(() => {
            streak++;
            nextQuestion();
        }, 800);

    } else {
        document.getElementById('feedback').innerText = '❌ Wrong';

        imgs.forEach(img => {
            img.classList.remove('selected');
            img.classList.add('reveal');
        });

        correctAnswers.forEach(t => {
            const img = Array.from(imgs).find(i =>
                i.src.includes(`/${cap(t)}.png`)
            );

            if (img) {
                img.classList.add('correct');
            }
        });

        setTimeout(() => {
            showPopup();
        }, 1500);
    }
}

function showPopup() {
    const el = document.getElementById('resultText');
    el.innerHTML = `<p class="final-label">Final streak</p><p class="final-score">${streak}</p>`;
    document.getElementById('popup').style.display = 'flex';
}

function restartGame() {
    startGame();
}

startGame();