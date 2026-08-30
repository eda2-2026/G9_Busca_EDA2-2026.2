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