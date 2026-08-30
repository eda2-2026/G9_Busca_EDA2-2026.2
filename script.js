let nivelAtual = 1;
const TOTAL_NIVEIS = 7;
let pontos = 0;
let inimigos = [];
let alvoRequisitado = null;
let bloqueado = false;

function iniciarNivel() {
    if (nivelAtual > TOTAL_NIVEIS) {
        exibirVitoriaFinal();
        return;
    }

    document.getElementById("onda-atual").textContent = `${nivelAtual} / ${TOTAL_NIVEIS}`;
    document.getElementById("btn-proximo").classList.add("oculto");
    document.getElementById("btn-sequencial").disabled = false;
    document.getElementById("btn-binario").disabled = false;
    bloqueado = false;

    inimigos = [];
    const container = document.getElementById("pista");
    container.innerHTML = "";

    const quantidade = 10 + Math.floor(((nivelAtual - 1) / (TOTAL_NIVEIS - 1)) * 20);
    
    const ids = new Set();
    while (ids.size < quantidade) {
        ids.add(Math.floor(Math.random() * 95) + 5);
    }

    const idsOrdenados = Array.from(ids).sort((a, b) => a - b);

    idsOrdenados.forEach(id => {
        inimigos.push({ id });
        const div = document.createElement("div");
        div.className = "inimigo";
        div.id = `inimigo-${id}`;
        div.innerHTML = `👾<span class="hp-badge">${id}</span>`;
        container.appendChild(div);
    });

    // Escolha estratégica 
    let idxAlvo;
    if (nivelAtual === 2) {
        idxAlvo = Math.floor(Math.random() * 2);
    } else {
        idxAlvo = Math.floor(Math.random() * inimigos.length);
    }

    alvoRequisitado = inimigos[idxAlvo].id;
    document.getElementById("alvo-requisitado").textContent = `ID #${alvoRequisitado}`;

    limparLogs();
}

// Busca Sequencial
function simulacaoSequencial(alvo) {
    let passos = 0;
    let logs = [];

    for (let i = 0; i < inimigos.length; i++) {
        passos++;
        let idAtual = inimigos[i].id;
        if (idAtual === alvo) {
            logs.push(`✅ Passo ${passos}: Testou #${idAtual} ➔ ALVO ENCONTRADO!`);
            break;
        } else {
            logs.push(`❌ Passo ${passos}: Testou #${idAtual} (não é o alvo)`);
        }
    }
    return { passos, logs };
}

// Busca Binária
function simulacaoBinaria(alvo) {
    let inicio = 0;
    let fim = inimigos.length - 1;
    let passos = 0;
    let logs = [];

    while (inicio <= fim) {
        passos++;
        let meio = Math.floor((inicio + fim) / 2);
        let valorMeio = inimigos[meio].id;

        if (valorMeio === alvo) {
            logs.push(`✅ Passo ${passos}: Meio #${valorMeio} ➔ ALVO ENCONTRADO!`);
            return { passos, logs };
        }

        if (valorMeio < alvo) {
            logs.push(`🔹 Passo ${passos}: Meio é #${valorMeio} (< ${alvo}). Corta esquerda [${inimigos[inicio].id}..${valorMeio}]`);
            inicio = meio + 1;
        } else {
            logs.push(`🔸 Passo ${passos}: Meio é #${valorMeio} (> ${alvo}). Corta direita [${valorMeio}..${inimigos[fim].id}]`);
            fim = meio - 1;
        }
    }
    return { passos, logs };
}

async function escolherAlgoritmo(escolhaJogador) {
    if (bloqueado) return;
    bloqueado = true;

    document.getElementById("btn-sequencial").disabled = true;
    document.getElementById("btn-binario").disabled = true;

    const resSeq = simulacaoSequencial(alvoRequisitado);
    const resBin = simulacaoBinaria(alvoRequisitado);

    renderizarLogColuna("log-seq", resSeq.logs, resSeq.passos);
    renderizarLogColuna("log-bin", resBin.logs, resBin.passos);

    // vencedor
    let melhorAlgoritmo = "binario";
    if (resSeq.passos < resBin.passos) {
        melhorAlgoritmo = "sequencial";
    } else if (resSeq.passos === resBin.passos) {
        melhorAlgoritmo = escolhaJogador; // Empate
    }

    // Animação
    if (escolhaJogador === "sequencial") {
        await animarBuscaSequencial(alvoRequisitado);
    } else {
        await animarBuscaBinaria(alvoRequisitado);
    }

    //resultado
    const banner = document.getElementById("banner-resultado");
    const acertou = (escolhaJogador === melhorAlgoritmo);

    if (acertou) {
        pontos++;
        document.getElementById("pontos").textContent = pontos;
        banner.className = "resultado-banner sucesso";
        banner.innerHTML = `<strong>VOCÊ ACERTOU!</strong> A ${escolhaJogador === "sequencial" ? "Busca Sequencial" : "Busca Binária"} foi mais rápida nesta rodada (${resSeq.passos} passo(s) vs ${resBin.passos} passo(s)).`;
    } else {
        banner.className = "resultado-banner erro";
        banner.innerHTML = `<strong>VOCÊ ERROU!</strong> A escolha mais eficiente era <strong>${melhorAlgoritmo === "sequencial" ? "Busca Sequencial" : "Busca Binária"}</strong> (${resSeq.passos} passo(s) Seq vs ${resBin.passos} passo(s) Bin).`;
    }

    // próximo nível
    document.getElementById("btn-proximo").classList.remove("oculto");
}

function renderizarLogColuna(containerId, listaLogs, totalPassos) {
    const box = document.getElementById(containerId);
    box.innerHTML = "";
    listaLogs.forEach(msg => {
        const p = document.createElement("p");
        p.className = "linha-log";
        p.textContent = msg;
        box.appendChild(p);
    });
    const resumo = document.createElement("div");
    resumo.className = "resumo-passos";
    resumo.textContent = `Total de comparações: ${totalPassos}`;
    box.appendChild(resumo);
}

// Animações visuais na pista
async function animarBuscaSequencial(alvo) {
    for (let i = 0; i < inimigos.length; i++) {
        const el = document.getElementById(`inimigo-${inimigos[i].id}`);
        if (el) el.classList.add("testando");
        await esperar(150);
        if (el) el.classList.remove("testando");
        if (inimigos[i].id === alvo) {
            if (el) el.classList.add("destruido");
            break;
        }
    }
}

async function animarBuscaBinaria(alvo) {
    let inicio = 0;
    let fim = inimigos.length - 1;
    while (inicio <= fim) {
        let meio = Math.floor((inicio + fim) / 2);
        const el = document.getElementById(`inimigo-${inimigos[meio].id}`);
        if (el) el.classList.add("testando");
        await esperar(200);
        if (el) el.classList.remove("testando");

        if (inimigos[meio].id === alvo) {
            if (el) el.classList.add("destruido");
            break;
        }
        if (inimigos[meio].id < alvo) inicio = meio + 1;
        else fim = meio - 1;
    }
}

function avançarNivel() {
    nivelAtual++;
    iniciarNivel();
}

function exibirVitoriaFinal() {
    limparLogs();
    const banner = document.getElementById("banner-resultado");
    banner.className = "resultado-banner sucesso";
    banner.innerHTML = `🏆 <strong>FIM DO JOGO!</strong> Você concluiu os 7 níveis com ${pontos} de 7 acertos estratégicos!`;
    document.getElementById("btn-proximo").classList.add("oculto");
}

function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function limparLogs() {
    document.getElementById("log-seq").innerHTML = "<p class='vazio'>Aguardando execução...</p>";
    document.getElementById("log-bin").innerHTML = "<p class='vazio'>Aguardando execução...</p>";
    const banner = document.getElementById("banner-resultado");
    banner.className = "resultado-banner";
    banner.innerHTML = "<span>Analise a fila de inimigos e faça sua escolha!</span>";
}

// Event Listeners
document.getElementById("btn-sequencial").addEventListener("click", () => escolherAlgoritmo("sequencial"));
document.getElementById("btn-binario").addEventListener("click", () => escolherAlgoritmo("binario"));
document.getElementById("btn-proximo").addEventListener("click", avançarNivel);

// Inicialização
iniciarNivel();