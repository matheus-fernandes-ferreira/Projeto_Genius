
var nivel = 1;
var pontuacao = 0;
var vetor = [1, 2, 3, 4];
var sequenciaDoJogador = [];
var sequenciaMaquina = [];
var alerta = document.getElementById('pontos');
var rodada = document.getElementById('rodada');
var botoes = document.querySelectorAll('.button');
var botaoStart = document.getElementById('start');
var botaoReset = document.getElementById('reset');

function gerarNumeroAleatorio() {
    return vetor[Math.floor(Math.random() * vetor.length)];
}

function iniciarJogo() {
    if (sequenciaDoJogador.length > 0) {
        return;
    }

    sequenciaMaquina.push(gerarNumeroAleatorio());
    exibirSequencia();
}

function exibirSequencia() {
    var exibir = 0;
    var intervalo = setInterval(function() {
        piscar(sequenciaMaquina[exibir]);
        exibir++;
        if (exibir >= sequenciaMaquina.length) {
            clearInterval(intervalo);
        }
    }, 1000);
}

function piscar(numero) {
    var btn = document.getElementById('btn' + numero);
    btn.classList.add('is-lit');
    setTimeout(function() {
        btn.classList.remove('is-lit');
    }, 500);
}

botoes.forEach(function(button) {
    button.addEventListener('click', function() {
        var numero = parseInt(this.id.replace('btn', ''), 10);
        sequenciaDoJogador.push(numero);
        if (sequenciaDoJogador.length === sequenciaMaquina.length) {
            verificarSequencia();
        }
    });
});

function verificarSequencia() {
    var acertou = sequenciaDoJogador.every(function(element, index) {
        return element === sequenciaMaquina[index];
    });
    sequenciaDoJogador = [];
    if (acertou) {
        rodada.innerHTML = nivel;
        nivel++;
        pontuacao += nivel * 10;
        alerta.innerHTML = pontuacao;
        iniciarJogo();
    } else {
        alert('Que pena, você errou! Tente novamente.');
        resetGame();
    }
}

function resetGame() {
    nivel = 1;
    pontuacao = 0;
    sequenciaDoJogador = [];
    sequenciaMaquina = [];
    rodada.innerHTML = 0;
    alerta.innerHTML = pontuacao;
}

botaoStart.addEventListener('click', iniciarJogo);
botaoReset.addEventListener('click', resetGame);
resetGame();