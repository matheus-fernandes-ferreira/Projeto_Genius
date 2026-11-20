(function () {
    var get = function (id) { return document.getElementById(id); };
    var pads = Array.prototype.slice.call(document.querySelectorAll('.pad'));
    var board = get('board');
    var hub = get('hub');
    var frequencies = [415, 310, 252, 209];
    var keys = { q: 0, '1': 0, w: 1, '2': 1, a: 2, '3': 2, s: 3, '4': 3 };
    var sequence = [];
    var playerIndex = 0;
    var score = 0;
    var round = 0;
    var best = 0;
    var isPlayerTurn = false;
    var token = 0;
    var audioContext = null;

    try { best = parseInt(localStorage.getItem('genius-best'), 10) || 0; } catch (error) { best = 0; }
    get('best').textContent = best;

    function sleep(milliseconds) {
        return new Promise(function (resolve) { setTimeout(resolve, milliseconds); });
    }

    function playTone(index, duration, type) {
        try {
            audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
            if (audioContext.state === 'suspended') { audioContext.resume(); }
            var oscillator = audioContext.createOscillator();
            var gain = audioContext.createGain();
            var start = audioContext.currentTime;
            oscillator.type = type || 'sine';
            oscillator.frequency.value = index < 0 ? 110 : frequencies[index];
            gain.gain.setValueAtTime(0.0001, start);
            gain.gain.exponentialRampToValueAtTime(.22, start + .02);
            gain.gain.exponentialRampToValueAtTime(.0001, start + duration / 1000);
            oscillator.connect(gain);
            gain.connect(audioContext.destination);
            oscillator.start(start);
            oscillator.stop(start + duration / 1000 + .05);
        } catch (error) { /* Áudio pode não estar disponível no navegador. */ }
    }

    function flash(index, duration) {
        pads[index].classList.add('on');
        playTone(index, duration);
        return sleep(duration).then(function () { pads[index].classList.remove('on'); });
    }

    function updateUi(state, message) {
        hub.dataset.s = state;
        get('status').textContent = message;
        get('score').textContent = score;
        get('round').textContent = round;
        get('hubRound').textContent = round;
        isPlayerTurn = state === 'turn';
        board.classList.toggle('lock', !isPlayerTurn);
    }

    function resetGame() {
        token += 1;
        sequence = [];
        playerIndex = 0;
        score = 0;
        round = 0;
        pads.forEach(function (pad) { pad.classList.remove('on'); });
        updateUi('idle', 'Pronto?');
        get('start').textContent = '▶ Iniciar jogo';
    }

    function startGame() {
        if (audioContext && audioContext.state === 'suspended') { audioContext.resume(); }
        resetGame();
        get('start').textContent = 'Jogando…';
        nextRound();
    }

    function nextRound() {
        var currentToken = token;
        round += 1;
        playerIndex = 0;
        sequence.push(Math.floor(Math.random() * 4));
        updateUi('watch', 'Observe');
        sleep(750).then(function () { playSequence(currentToken); });
    }

    async function playSequence(currentToken) {
        var duration = Math.max(230, 620 - round * 22);
        for (var index = 0; index < sequence.length; index += 1) {
            if (currentToken !== token) { return; }
            await flash(sequence[index], duration);
            await sleep(duration * .45);
        }
        if (currentToken === token) { updateUi('turn', 'Sua vez'); }
    }

    function pressPad(index) {
        if (!isPlayerTurn) { return; }
        var currentToken = token;
        flash(index, 260);
        if (index !== sequence[playerIndex]) { gameOver(); return; }
        playerIndex += 1;
        score += 10;
        get('score').textContent = score;
        if (playerIndex === sequence.length) {
            isPlayerTurn = false;
            board.classList.add('lock');
            sleep(900).then(function () { if (currentToken === token) { nextRound(); } });
        }
    }

    function gameOver() {
        token += 1;
        isPlayerTurn = false;
        playTone(-1, 600, 'sawtooth');
        if (score > best) {
            best = score;
            get('best').textContent = best;
            try { localStorage.setItem('genius-best', best); } catch (error) { /* armazenamento opcional */ }
        }
        updateUi('over', 'Errou! ' + score + ' pts');
        board.classList.remove('shake');
        void board.offsetWidth;
        board.classList.add('shake');
        get('start').textContent = 'Jogar de novo';
    }

    pads.forEach(function (pad) {
        var index = Number(pad.dataset.i);
        pad.addEventListener('pointerdown', function (event) { event.preventDefault(); pressPad(index); });
        pad.addEventListener('click', function (event) { if (event.detail === 0) { pressPad(index); } });
    });

    document.addEventListener('keydown', function (event) {
        if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) { return; }
        var index = keys[event.key.toLowerCase()];
        if (index !== undefined) { event.preventDefault(); pressPad(index); }
    });

    get('start').addEventListener('click', startGame);
    get('reset').addEventListener('click', resetGame);
    resetGame();
}());
