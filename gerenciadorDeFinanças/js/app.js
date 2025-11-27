// js/app.js
import * as Auth from './modules/auth.js';
import * as Dashboard from './modules/dashboard.js';
import * as Transactions from './modules/transactions.js';
import * as Data from './modules/data.js';
import * as UI from './modules/ui.js';

document.addEventListener('DOMContentLoaded', async () => {

    const btnDefinirRenda = document.getElementById('btn-definir-renda');
    const btnResetar = document.getElementById('btn-resetar');
    const balancoCircle = document.getElementById('balanco-circle');
    const btnLogout = document.getElementById('btn-logout');
    const formTransacao = document.getElementById('form-transacao');
    const listaTransacoes = document.getElementById('lista-transacoes');
    const categoriaSelect = document.getElementById('categoria');
    const buscaInput = document.getElementById('input-busca');
    const btnCancelEdit = document.getElementById('btn-cancel-edit');

    // --- Listeners ---
    Auth.initAuthListeners();
    btnLogout.addEventListener('click', Auth.handleLogout);

    btnDefinirRenda.addEventListener('click', Dashboard.definirRenda);
    
    balancoCircle.addEventListener('click', () => {
        Dashboard.toggleDashboard();
        if (document.getElementById('orcamento-visual').classList.contains('ativo')) {
            Dashboard.animarBordasPequenas();
        }
    });

    formTransacao.addEventListener('submit', Transactions.handleFormSubmit);
    listaTransacoes.addEventListener('click', Transactions.handleListClick);
    btnResetar.addEventListener('click', () => Transactions.resetarMes(true));
    btnCancelEdit.addEventListener('click', Transactions.cancelarEdicao);

    buscaInput.addEventListener('input', Transactions.filtrarDespesas);

    categoriaSelect.addEventListener('change', () => {
        categoriaSelect.className = categoriaSelect.value;
    });

    // --- Inicialização ---
    const user = localStorage.getItem(Data.CURRENT_USER_KEY);
    if (user) {
        Data.setCurrentUser(user);
        
        // Carrega dados (agora assíncrono)
        try {
            await Data.loadData();
            
            // Renderiza
            UI.showAppScreen(user, Data.rendaTotal, Data.transacoes);
            Dashboard.atualizarTudo();
        } catch (e) {
            console.error("Erro ao iniciar app:", e);
        }
    } else {
        UI.showLoginScreen();
    }
});
