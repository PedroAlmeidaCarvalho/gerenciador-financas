
import { transacoes } from './data.js';

// --- Seletores do App Principal ---
const loginContainer = document.querySelector('.login-container');
const mainContainer = document.querySelector('.container');
const btnLogout = document.getElementById('btn-logout');
const welcomeMessage = document.getElementById('welcome-message');
const listaTransacoes = document.getElementById('lista-transacoes');
const rendaInput = document.getElementById('renda-mensal');
const balancoValor = document.getElementById('balanco-valor');
const metaEssencialEl = document.getElementById('meta-essencial');
const metaOpcionalEl = document.getElementById('meta-opcional');
const metaInvestimentoEl = document.getElementById('meta-investimento');
const gastoEssencialEl = document.getElementById('gasto-essencial');
const gastoOpcionalEl = document.getElementById('gasto-opcional');
const gastoInvestimentoEl = document.getElementById('gasto-investimento');
const formTransacao = document.getElementById('form-transacao');
const editIdInput = document.getElementById('edit-id');
const descricaoInput = document.getElementById('descricao');
const valorInput = document.getElementById('valor');
const categoriaSelect = document.getElementById('categoria');
const btnSubmit = document.getElementById('btn-submit');

// --- Sistema de Notificações ---
function mostrarNotificacao(mensagem, tipo = 'sucesso') {
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao ${tipo}`;
    notificacao.textContent = mensagem;
    notificacao.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${tipo === 'sucesso' ? '#4caf50' : '#f44336'};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notificacao);
    
    setTimeout(() => {
        notificacao.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notificacao.remove(), 300);
    }, 3000);
}

// Adiciona animações CSS
if (!document.querySelector('style[data-notificacao]')) {
    const style = document.createElement('style');
    style.setAttribute('data-notificacao', 'true');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(400px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

export function notificacaoSucesso(mensagem) {
    mostrarNotificacao(mensagem, 'sucesso');
}

export function notificacaoErro(mensagem) {
    mostrarNotificacao(mensagem, 'erro');
}

// --- Funções de UI para Módulos Externos ---

export function getFormElements() {
    return { formTransacao, editIdInput, descricaoInput, valorInput, categoriaSelect, btnSubmit };
}

export function getRendaInput() {
    return rendaInput;
}

export function getDashboardElements() {
    return {
        balancoValor, metaEssencialEl, metaOpcionalEl, metaInvestimentoEl,
        gastoEssencialEl, gastoOpcionalEl, gastoInvestimentoEl,
        circleEssencial: document.getElementById('circle-essencial'),
        circleOpcional: document.getElementById('circle-opcional'),
        circleInvestimento: document.getElementById('circle-investimento'),
        balancoCircle: document.getElementById('balanco-circle'),
        orcamentoVisual: document.getElementById('orcamento-visual'),
    };
}

export function getFilterElements() {
    return {
        buscaInput: document.getElementById('input-busca'),
        filtroDia: document.getElementById('filtro-dia'),
        filtroMes: document.getElementById('filtro-mes'),
        filtroAno: document.getElementById('filtro-ano'),
        listaTransacoes,
    };
}

// --- Funções de Navegação de Tela ---

export function showLoginScreen() {
    loginContainer.style.display = 'block';
    mainContainer.style.display = 'none';
    btnLogout.style.display = 'none';
    welcomeMessage.textContent = '';
    
    // Reset dos forms de login (se necessário)
    document.getElementById('form-login').style.display = 'flex';
    document.getElementById('form-register').style.display = 'none';
    document.getElementById('form-forgot-password').style.display = 'none';
}

export function showAppScreen(username, rendaValor, transacoesData) {
    loginContainer.style.display = 'none';
    mainContainer.style.display = 'block';
    btnLogout.style.display = 'block';
    welcomeMessage.textContent = `Olá, ${username}!`;

    if (rendaValor > 0) rendaInput.value = rendaValor;
    
    // Limpa e Adiciona Transações ao DOM
    listaTransacoes.innerHTML = '';
    transacoesData.sort((a, b) => b.id - a.id).forEach(adicionarDespesaDOM);
}

// --- Funções de Formulário ---

export function limparFormulario() {
    formTransacao.reset();
    categoriaSelect.className = '';
    descricaoInput.focus();
}

export function setEditMode(transacao) {
    formTransacao.classList.add('edit-mode');
    editIdInput.value = transacao.id;
    descricaoInput.value = transacao.descricao;
    valorInput.value = transacao.valor;
    categoriaSelect.value = transacao.categoria;
    categoriaSelect.className = transacao.categoria;
    btnSubmit.textContent = 'Salvar Edição';
    formTransacao.scrollIntoView({ behavior: 'smooth' });
    descricaoInput.focus();
}

export function cancelEditMode() {
    formTransacao.classList.remove('edit-mode');
    editIdInput.value = '';
    btnSubmit.textContent = 'Adicionar Despesa';
    categoriaSelect.className = '';
    limparFormulario();
}

// --- Funções de Transações/Lista ---

export function formatarData(timestamp) {
    if (!timestamp) return '';
    const data = new Date(timestamp);
    const options = {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    };
    return data.toLocaleString('pt-BR', options).replace(',', ' -');
}

export function adicionarDespesaDOM(despesa) {
    const item = document.createElement('li');
    item.className = despesa.categoria;
    item.dataset.timestamp = despesa.timestamp;

    const dataFormatada = formatarData(despesa.timestamp || despesa.id);

    item.innerHTML = `
        <div class="transacao-info">
            <span class="transacao-descricao">${despesa.descricao}</span>
            <span class="transacao-valor">- R$ ${despesa.valor.toFixed(2)}</span>
            <span class="transacao-data">${dataFormatada}</span>
        </div>
        <div class="transacao-acoes">
            <button class="btn-edit" data-id="${despesa.id}" title="Editar">
                <svg fill="none" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4L18.5 2.5z"></path></svg>
            </button>
            <button class="btn-delete" data-id="${despesa.id}" title="Excluir">
                <svg fill="none" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
        </div>`;
    listaTransacoes.prepend(item);
}

export function removeDespesaDOM(id) {
    document.querySelector(`.btn-delete[data-id="${id}"]`).closest('li').remove();
}

export function updateDespesaDOM(id, transacao) {
    const itemLi = document.querySelector(`.btn-edit[data-id="${id}"]`).closest('li');
    if (!itemLi) return;
    itemLi.className = transacao.categoria;
    itemLi.querySelector('.transacao-info .transacao-descricao').textContent = transacao.descricao;
    itemLi.querySelector('.transacao-info .transacao-valor').textContent = `- R$ ${transacao.valor.toFixed(2)}`;
}

export function resetarListaDOM() {
    listaTransacoes.innerHTML = '';
}