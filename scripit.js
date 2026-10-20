/* ====== Jogo da Memória — lógica ====== */
(function () {
  "use strict";

  // Ícones (emojis): não precisam de arquivos nem de internet.
  // Para usar imagens, troque por caminhos, ex.: "img/gato.png",
  // e veja o comentário em criarCarta().
  var ICONES = [
    "🐶", "🐱", "🦊", "🐼", "🦁", "🐸",
    "🐵", "🐙", "🦄", "🐢", "🦋", "🐝"
  ];

  var tabuleiro = document.getElementById("tabuleiro");
  var elJogadas = document.getElementById("jogadas");
  var elTempo = document.getElementById("tempo");
  var elRecorde = document.getElementById("recorde");
  var elMensagem = document.getElementById("mensagem");
  var selNivel = document.getElementById("nivel");
  var btnReiniciar = document.getElementById("reiniciar");

  var primeira = null;
  var segunda = null;
  var travado = false;
  var jogadas = 0;
  var paresAchados = 0;
  var totalPares = 0;
  var segundos = 0;
  var relogio = null;

  /* ---------- utilidades ---------- */

  function embaralhar(lista) {
    var a = lista.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function formatarTempo(s) {
    var m = Math.floor(s / 60);
    var r = s % 60;
    return (m < 10 ? "0" : "") + m + ":" + (r < 10 ? "0" : "") + r;
  }

  function chaveRecorde() {
    return "memoria-recorde-" + selNivel.value;
  }

  function lerRecorde() {
    try {
      var v = localStorage.getItem(chaveRecorde());
      return v ? parseInt(v, 10) : null;
    } catch (e) {
      return null;
    }
  }

  function salvarRecorde(valor) {
    try {
      localStorage.setItem(chaveRecorde(), String(valor));
    } catch (e) { /* armazenamento indisponível: ignora */ }
  }

  function mostrarRecorde() {
    var r = lerRecorde();
    elRecorde.textContent = r ? r + " jogadas" : "—";
  }

  /* ---------- relógio ---------- */

  function iniciarRelogio() {
    if (relogio) return;
    relogio = setInterval(function () {
      segundos++;
      elTempo.textContent = formatarTempo(segundos);
    }, 1000);
  }

  function pararRelogio() {
    clearInterval(relogio);
    relogio = null;
  }

  /* ---------- cartas ---------- */

  function criarCarta(icone, indice) {
    var botao = document.createElement("button");
    botao.type = "button";
    botao.className = "carta";
    botao.dataset.icone = icone;
    botao.setAttribute("aria-label", "Carta " + (indice + 1) + ", virada para baixo");

    // Para usar IMAGENS no lugar de emojis, troque a linha da frente por:
    // '<span class="carta__face carta__frente"><img src="' + icone + '" alt="" width="64" height="64"></span>'
    botao.innerHTML =
      '<span class="carta__miolo">' +
        '<span class="carta__face carta__verso"></span>' +
        '<span class="carta__face carta__frente" aria-hidden="true">' + icone + "</span>" +
      "</span>";

    botao.addEventListener("click", function () { virar(botao); });
    return botao;
  }

  function virar(carta) {
    if (travado) return;
    if (carta === primeira) return;
    if (carta.classList.contains("par")) return;

    iniciarRelogio();
    carta.classList.add("virada");
    carta.setAttribute("aria-label", "Carta virada: " + carta.dataset.icone);

    if (!primeira) {
      primeira = carta;
      return;
    }

    segunda = carta;
    jogadas++;
    elJogadas.textContent = jogadas;
    conferir();
  }

  function conferir() {
    if (primeira.dataset.icone === segunda.dataset.icone) {
      acertou();
    } else {
      errou();
    }
  }

  function acertou() {
    primeira.classList.remove("virada");
    segunda.classList.remove("virada");
    primeira.classList.add("par");
    segunda.classList.add("par");
    primeira.setAttribute("aria-label", "Par encontrado: " + primeira.dataset.icone);
    segunda.setAttribute("aria-label", "Par encontrado: " + segunda.dataset.icone);
    primeira.disabled = true;
    segunda.disabled = true;
    paresAchados++;
    limparSelecao();

    if (paresAchados === totalPares) venceu();
  }

  function errou() {
    travado = true;
    primeira.classList.add("erro");
    segunda.classList.add("erro");

    setTimeout(function () {
      [primeira, segunda].forEach(function (c, i) {
        c.classList.remove("virada", "erro");
        c.setAttribute("aria-label", "Carta virada para baixo");
      });
      limparSelecao();
    }, 850);
  }

  function limparSelecao() {
    primeira = null;
    segunda = null;
    travado = false;
  }

  function venceu() {
    pararRelogio();
    var recorde = lerRecorde();
    var texto = "Parabéns! Você terminou em " + jogadas + " jogadas e " + formatarTempo(segundos) + ".";

    if (!recorde || jogadas < recorde) {
      salvarRecorde(jogadas);
      mostrarRecorde();
      texto += " Novo recorde!";
    }

    elMensagem.textContent = texto;
    elMensagem.hidden = false;
  }

  /* ---------- início / reinício ---------- */

  function novoJogo() {
    pararRelogio();
    limparSelecao();
    jogadas = 0;
    paresAchados = 0;
    segundos = 0;
    elJogadas.textContent = "0";
    elTempo.textContent = "00:00";
    elMensagem.hidden = true;
    elMensagem.textContent = "";
    mostrarRecorde();

    totalPares = parseInt(selNivel.value, 10);
    var escolhidos = embaralhar(ICONES).slice(0, totalPares);
    var baralho = embaralhar(escolhidos.concat(escolhidos));

    // 12 cartas → 4 colunas | 16 → 4 colunas | 20 → 5 colunas
    tabuleiro.style.setProperty("--colunas", baralho.length === 20 ? 5 : 4);

    tabuleiro.innerHTML = "";
    baralho.forEach(function (icone, i) {
      tabuleiro.appendChild(criarCarta(icone, i));
    });
  }

  btnReiniciar.addEventListener("click", novoJogo);
  selNivel.addEventListener("change", novoJogo);

  novoJogo();
})();