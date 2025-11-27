import * as Data from './data.js';
import * as UI from './ui.js';
import * as Transactions from './transactions.js';

const {
    balancoValor, metaEssencialEl, metaOpcionalEl, metaInvestimentoEl,
    gastoEssencialEl, gastoOpcionalEl, gastoInvestimentoEl,
    circleEssencial, circleOpcional, circleInvestimento, balancoCircle,
    orcamentoVisual
} = UI.getDashboardElements();

// Extrai as constantes de percentuais
const { essencial: PERC_ESSENCIAL, opcional: PERC_OPCIONAL, investimento: PERC_INVESTIMENTO } = Data.BUDGET_PERCENTUALS;


// --- Funções de Gráfico (Animação) ---

export function updateCircleProgress(element, percentage, color) {
    const progress = Math.min(100, Math.max(0, percentage));
    const fillDegree = (progress / 100) * 360;
    element.style.setProperty('--fill-percentage', `${fillDegree}deg`);
    element.style.setProperty('--cor-borda-progresso', color);
}

export function animarBordasPequenas() {
    [circleEssencial, circleOpcional, circleInvestimento].forEach(circle => {
        circle.style.animation = 'none';
        circle.offsetHeight; // Força reflow para reiniciar
        circle.style.animation = `fillCircle 0.5s ease-out forwards`;
    });
}

function atualizarBordaBalanco() {
    if (Data.gastoTotal === 0) {
        balancoCircle.style.background = 'var(--cor-borda-cinza)';
        return;
    }
    // Calcula o percentual de cada categoria em relação ao Gasto Total
    const pEssencial = (Data.gastosPorCategoria.essencial / Data.gastoTotal) * 360;
    const pOpcional = (Data.gastosPorCategoria.opcional / Data.gastoTotal) * 360;
    const grauEssencial = pEssencial;
    const grauOpcional = pEssencial + pOpcional;

    balancoCircle.style.background = `conic-gradient(
        var(--cor-essencial) 0deg ${grauEssencial}deg,
        var(--cor-opcional) ${grauEssencial}deg ${grauOpcional}deg,
        var(--cor-investimento) ${grauOpcional}deg 360deg
    )`;
}

export function atualizarBordasCategorias() {
    if (Data.rendaTotal > 0) {
        // Essencial
        const metaEssencial = Data.rendaTotal * PERC_ESSENCIAL;
        const percentEssencial = metaEssencial > 0 ? (Data.gastosPorCategoria.essencial / metaEssencial) * 100 : 0;
        updateCircleProgress(circleEssencial, percentEssencial, 'var(--cor-essencial)');
        percentEssencial > 100 ? circleEssencial.classList.add('over-budget') : circleEssencial.classList.remove('over-budget');

        // Opcional
        const metaOpcional = Data.rendaTotal * PERC_OPCIONAL;
        const percentOpcional = metaOpcional > 0 ? (Data.gastosPorCategoria.opcional / metaOpcional) * 100 : 0;
        updateCircleProgress(circleOpcional, percentOpcional, 'var(--cor-opcional)');
        percentOpcional > 100 ? circleOpcional.classList.add('over-budget') : circleOpcional.classList.remove('over-budget');

        // Investimento
        const metaInvestimento = Data.rendaTotal * PERC_INVESTIMENTO;
        const percentInvestimento = metaInvestimento > 0 ? (Data.gastosPorCategoria.investimento / metaInvestimento) * 100 : 0;
        updateCircleProgress(circleInvestimento, percentInvestimento, 'var(--cor-investimento)');
        percentInvestimento > 100 ? circleInvestimento.classList.add('over-budget') : circleInvestimento.classList.remove('over-budget');

    } else {
        [circleEssencial, circleOpcional, circleInvestimento].forEach(circle => {
            updateCircleProgress(circle, 0, 'var(--cor-borda-cinza)');
            circle.classList.remove('over-budget');
        });
    }
}


// --- Funções Principais do Dashboard ---

export function definirRenda() {
    const rendaInput = UI.getRendaInput();
    const renda = parseFloat(rendaInput.value);
    
    if (isNaN(renda) || renda <= 0) return alert('Por favor, insira um valor de renda válido.');
    
    const rendaAntiga = Data.rendaTotal;
    Data.setRendaTotal(renda);

    if (rendaAntiga > 0 && Data.transacoes.length > 0 && confirm("Você definiu uma nova renda. Deseja limpar as transações do mês anterior?")) {
        Transactions.resetarMes(false);
    }
    
    atualizarTudo();
}

export function atualizarTudo() {
    // Atualiza Metas
    metaEssencialEl.textContent = `Meta: R$ ${(Data.rendaTotal * PERC_ESSENCIAL).toFixed(2)}`;
    metaOpcionalEl.textContent = `Meta: R$ ${(Data.rendaTotal * PERC_OPCIONAL).toFixed(2)}`;
    metaInvestimentoEl.textContent = `Meta: R$ ${(Data.rendaTotal * PERC_INVESTIMENTO).toFixed(2)}`;

    // Atualiza Saldo Restante
    const saldoRestante = Data.rendaTotal - Data.gastoTotal;
    balancoValor.textContent = `R$ ${saldoRestante.toFixed(2)}`;
    balancoValor.className = saldoRestante >= 0 ? 'positivo' : 'negativo';

    // Atualiza Gastos por Categoria
    gastoEssencialEl.textContent = `R$ ${Data.gastosPorCategoria.essencial.toFixed(2)}`;
    gastoOpcionalEl.textContent = `R$ ${Data.gastosPorCategoria.opcional.toFixed(2)}`;
    gastoInvestimentoEl.textContent = `R$ ${Data.gastosPorCategoria.investimento.toFixed(2)}`;

    // Atualiza Gráficos
    atualizarBordaBalanco();
    atualizarBordasCategorias();
    
    // Salva o estado
    Data.saveData();
}

export function toggleDashboard() {
    orcamentoVisual.classList.toggle('ativo');
}