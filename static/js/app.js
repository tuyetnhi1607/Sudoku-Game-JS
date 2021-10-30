document.querySelector('#dark-mode-toggle').addEventListener('click', ()=>{
    document.body.classList.toggle('dark');
    const isdarkMode = document.body.classList.contains('dark-mode-toggle');
    console.log(isdarkMode, "hihi");
    localStorage.setItem('dark-mode', isdarkMode);
    //change mobile status bar color
    document.querySelector('meta[name="theme-color"').setAttribute('content', isdarkMode ? '#1a1a2e':'#fff');
})
// init value 
//screen
const start_screen = document.querySelector("#start-screen");
const game_screen = document.querySelector("#game-screen");
const pause_screen = document.querySelector("#pause-screen");

const name_input = document.querySelector("#input-name");
const pause_icon = document.querySelector(".bx-pause");
const player_name = document.querySelector("#player-name");
const game_level = document.querySelector("#game-level");
console.log("sdff", game_level);
const game_time = document.querySelector("#game-time");
const cells = document.querySelectorAll('.main-grid-cell');
console.log("sdff", game_time);
let level_index = 0;
let level = CONSTANT.LEVEL[level_index];

let timer = null;
let pause = false;
let seconds = 0;
//................................................................................................................................


const getGameInfo = () => JSON.parse(localStorage.getItem('game'));

//add space for 9 cells 
const initGameGrid = () => {
    let index = 0;
    for (let i = 0; i < Math.pow(CONSTANT.GRID_SIZE,2); i++){
        let row = Math.floor(i/CONSTANT.GRID_SIZE);
        let  col = i % CONSTANT.GRID_SIZE;
        if(row === 2 || row === 5) cells[index].style.marginBottom = '10px';
        if(col === 2 || col === 5) cells[index].style.marginRight = '10px';
        index++;
    }
    
    
}

const initCellsEvent = () => {
    cells.forEach((e, index) => {
        e.addEventListener('click', () => {
            if (!e.classList.contains('filled')) {
                cells.forEach(e => e.classList.remove('selected'));

                selected_cell = index;
                e.classList.remove('err');
                e.classList.add('selected');
                resetBg();
                hoverBg(index);
            }
        })
    })
}


const setPlayerName = (name) => localStorage.setItem('player_name', name);
const getPlayerName = () => localStorage.getItem('player_name');

const showTime = (seconds) => new Date(seconds * 1000).toISOString().substr(11, 8);


const clearSudoku = () => {
    for (let i = 0; i < Math.pow(CONSTANT.GRID_SIZE, 2); i++) {
        cells[i].innerHTML = '';
        cells[i].classList.remove('filled');
        cells[i].classList.remove('selected');
    }
}

const saveGameInfo = () => {
    let game = {
        level: level_index,
        seconds: seconds,
        su: {
            original: su.original,
            question: su.question,
            answer: su_answer
        }
    }
    localStorage.setItem('game', JSON.stringify(game));
}


const initSudoku = () => {
    // clear old sudoku
    clearSudoku();
    resetBg();
    // generate sudoku puzzle here
    su = sudokuGen(level);
    su_answer = [...su.question];

    seconds = 0;

    saveGameInfo();

    // show sudoku to div
    for (let i = 0; i < Math.pow(CONSTANT.GRID_SIZE, 2); i++) {
        let row = Math.floor(i / CONSTANT.GRID_SIZE);
        let col = i % CONSTANT.GRID_SIZE;
        
        cells[i].setAttribute('data-value', su.question[row][col]);

        if (su.question[row][col] !== 0) {
            cells[i].classList.add('filled');
            cells[i].innerHTML = su.question[row][col];
        }
    }
}

const loadSudoku = () => {
    let game = getGameInfo();

    game_level.innerHTML = CONSTANT.LEVEL_NAME[game.level];

    su = game.su;

    su_answer = su.answer;

    seconds = game.seconds;
    game_time.innerHTML = showTime(seconds);

    level_index = game.level;

    // show sudoku to div
    for (let i = 0; i < Math.pow(CONSTANT.GRID_SIZE, 2); i++) {
        let row = Math.floor(i / CONSTANT.GRID_SIZE);
        let col = i % CONSTANT.GRID_SIZE;
        
        cells[i].setAttribute('data-value', su_answer[row][col]);
        cells[i].innerHTML = su_answer[row][col] !== 0 ? su_answer[row][col] : '';
        if (su.question[row][col] !== 0) {
            cells[i].classList.add('filled');
        }
    }
}

const hoverBg = (index) => {
    let row = Math.floor(index / CONSTANT.GRID_SIZE);
    let col = index % CONSTANT.GRID_SIZE;

    let box_start_row = row - row % 3;
    let box_start_col = col - col % 3;

    for (let i = 0; i < CONSTANT.BOX_SIZE; i++) {
        for (let j = 0; j < CONSTANT.BOX_SIZE; j++) {
            let cell = cells[9 * (box_start_row + i) + (box_start_col + j)];
            cell.classList.add('hover');
        }
    }

    let step = 9;
    while (index - step >= 0) {
        cells[index - step].classList.add('hover');
        step += 9;
    }

    step = 9;
    while (index + step < 81) {
        cells[index + step].classList.add('hover');
        step += 9;
    }

    step = 1;
    while (index - step >= 9*row) {
        cells[index - step].classList.add('hover');
        step += 1;
    }

    step = 1;
     while (index + step < 9*row + 9) {
        cells[index + step].classList.add('hover');
        step += 1;
    }
}

const initNumberInputEvent = () => {
    number_inputs.forEach((e, index) => {
        e.addEventListener('click', () => {
            if (!cells[selected_cell].classList.contains('filled')) {
                cells[selected_cell].innerHTML = index + 1;
                cells[selected_cell].setAttribute('data-value', index + 1);
                // add to answer
                let row = Math.floor(selected_cell / CONSTANT.GRID_SIZE);
                let col = selected_cell % CONSTANT.GRID_SIZE;
                su_answer[row][col] = index + 1;
                // save game
                saveGameInfo()
                // -----
                removeErr();
                checkErr(index + 1);
                cells[selected_cell].classList.add('zoom-in');
                setTimeout(() => {
                    cells[selected_cell].classList.remove('zoom-in');
                }, 500);

                // check game win
                if (isGameWin()) {
                    removeGameInfo();
                    showResult();
                }
                // ----
            }
        })
    })
}


const resetBg = () => {
    cells.forEach(e => e.classList.remove('hover'));
}

const startGame = () => {
    start_screen.classList.remove('active');
    game_screen.classList.add('active');

    player_name.innerHTML = name_input.value.trim();
    setPlayerName(name_input.value.trim());

    game_level.innerHTML = CONSTANT.LEVEL_NAME[level_index];

    showTime(seconds);

    timer = setInterval(() => {
        if (!pause) {
            seconds = seconds + 1;
            game_time.innerHTML = showTime(seconds);
        }
    }, 1000);
}

document.querySelector("#btn-level").addEventListener("click", (e)=>{
    level_index = level_index + 1 > CONSTANT.LEVEL.length -1 ? 0 : level_index + 1;
    level = CONSTANT.LEVEL[level_index];
    //console.log(level,'hihi');
    e.target.innerHTML = CONSTANT.LEVEL_NAME[level_index];
})
// add but ton event 
document.querySelector('#btn-play').addEventListener('click', () => {
    if(name_input.value.trim().length > 0) {
       initSudoku();
        startGame();
    } else {
        name_input.classList.add('input-error');
        setTimeout(() => {
            name_input.classList.remove('input-error');
            name_input.focus();
        }, 500);
    }
})
document.querySelector('#btn-pause').addEventListener('click', () => {
    
    pause_screen.classList.add('active');
    if(!pause) {
        pause_icon.classList.add('bx-stop');
        pause = true;
    }
    else{
        pause_icon.classList.remove('bx-stop');
        pause = false;
    }
});
document.querySelector('#btn-delete').addEventListener('click', () => {
    cells[selected_cell].innerHTML = '';
    cells[selected_cell].setAttribute('data-value', 0);

    let row = Math.floor(selected_cell / CONSTANT.GRID_SIZE);
    let col = selected_cell % CONSTANT.GRID_SIZE;

    su_answer[row][col] = 0;

    removeErr();
})

const init = () => {
    
    const darkmode = localStorage.getItem('darkmode');
    document.body.classList.add(darkmode ? 'dark' : '');
    document.querySelector('meta[name="theme-color"').setAttribute('content', darkmode ? '#1a1a2e':'#fff');
    const game = getGameInfo();
    // document.querySelector('#btn-coutinue').style.display = game ? 'grid' : 'none';
    initGameGrid();
    initCellsEvent();
    initNumberInputEvent();
    // if (getPlayerName()) {
    //     name_input.value = getPlayerName();
    // } else {
    //     name_input.focus();
    // }
}

init();