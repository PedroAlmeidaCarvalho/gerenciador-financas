// js/modules/transactions.js
import * as Data from './data.js';
import * as UI from './ui.js';
import * as Dashboard from './dashboard.js';

const { editIdInput, descricaoInput, valorInput, categoriaSelect } = UI.getFormElements();
const { buscaInput, filtroDia, filtroMes, filtroAno, listaTransacoes } = UI.getFilterElements();

// --- Validação ---
function validarTransacao(descricao, valor, categoria) {
    if (descricao.trim() === '') {
        UI.notificacaoErro('Preencha a descrição.');
        return false;
    }
    if (isNaN(valor) || valor <= 0) {
        UI.notificacaoErro('Valor inválido.');
        return false;
    }
    if (categoria === '') {
        UI.notificacaoErro('Selecione uma categoria.');
        return false;
    }
    return true;
}

// --- Handlers ---

export async function handleFormSubmit(e) {
    e.preventDefault();
    const idEdicao = editIdInput.value;
    
    // Mostra loading ou desabilita botão aqui seria bom
    
    if (idEdicao) {
        await salvarEdicao(idEdicao); // IDs do backend podem ser strings
    } else {
        await adicionarDespesa();
    }
}

async function adicionarDespesa() {
    const descricao = descricaoInput.value;
    const valor = parseFloat(valorInput.value);
    const categoria = categoriaSelect.value;

    if (!validarTransacao(descricao, valor, categoria)) return;

    // Objeto temporário (o ID será gerado pelo backend)
    const despesa = { descricao, valor, categoria };

    try {
        await Data.addTransaction(despesa);
        
        // Recarrega a UI com os dados atualizados
        UI.resetarListaDOM();
        Data.transacoes.forEach(UI.adicionarDespesaDOM);
        Dashboard.atualizarTudo();
        
        UI.limparFormulario();
        UI.notificacaoSucesso('Adicionado!');
    } catch (error) {
        UI.notificacaoErro('Erro ao salvar no servidor.');
    }
}

export function iniciarEdicao(id) {
    // Busca pelo ID (pode precisar converter para int se o array local usar int e backend string)
    const transacao = Data.transacoes.find(t => t.id == id); 
    if (!transacao) return;
    UI.setEditMode(transacao);
}

async function salvarEdicao(id) {
    const novoValor = parseFloat(valorInput.value);
    const novaCategoria = categoriaSelect.value;
    const novaDescricao = descricaoInput.value;

    if (!validarTransacao(novaDescricao, novoValor, novaCategoria)) return;

    try {
        const atualizado = await Data.updateTransaction(id, novaDescricao, novoValor, novaCategoria);
        if (atualizado) {
            UI.updateDespesaDOM(id, atualizado);
            UI.cancelEditMode();
            Dashboard.atualizarTudo();
            UI.notificacaoSucesso('Atualizado!');
        }
    } catch (error) {
        UI.notificacaoErro('Erro ao atualizar.');
    }
}

export function cancelarEdicao() {
    UI.cancelEditMode();
}

async function excluirTransacao(id) {
    if (confirm('Excluir esta despesa?')) {
        try {
            const sucesso = await Data.removeTransaction(id);
            if (sucesso) {
                UI.removeDespesaDOM(id);
                Dashboard.atualizarTudo();
                UI.notificacaoSucesso('Excluído!');
            }
        } catch (error) {
            UI.notificacaoErro('Erro ao excluir.');
        }
    }
}

export function resetarMes(confirmar = true) {
    if (confirmar && !confirm('Resetar mês localmente?')) return;
    Data.resetTransactionData();
    UI.resetarListaDOM();
    Dashboard.atualizarTudo();
    UI.notificacaoSucesso('Dados locais limpos.');
}

// --- Filtros e Listeners ---

export function filtrarDespesas() {
    // Mesma lógica de filtro, pois opera sobre o DOM ou Data.transacoes
    const termoBusca = buscaInput.value.toLowerCase();
    const itens = listaTransacoes.querySelectorAll('li');

    itens.forEach(item => {
        const descricao = item.querySelector('.transacao-descricao').textContent.toLowerCase();
        if (descricao.includes(termoBusca)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

export function handleListClick(e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    
    const id = btn.dataset.id; // Mantém como string para compatibilidade com backend
    if (btn.classList.contains('btn-delete')) excluirTransacao(id);
    if (btn.classList.contains('btn-edit')) iniciarEdicao(id);
}
