// js/modules/data.js
import * as API from './api.js';

// --- Constantes Globais ---
export const USERS_DB_KEY = 'financasAppUsers';
export const CURRENT_USER_KEY = 'financasAppCurrentUser';
export const BUDGET_PERCENTUALS = {
    essencial: 0.50,
    opcional: 0.30,
    investimento: 0.20
};

// --- Estado da Aplicação ---
export let currentUser = null;
export let rendaTotal = 0.00;
export let gastoTotal = 0.00;
export let gastosPorCategoria = { essencial: 0.00, opcional: 0.00, investimento: 0.00 };
export let transacoes = [];

// --- Gerenciamento de Estado Local (Cálculos) ---

function recalcularTotais() {
    gastoTotal = 0;
    gastosPorCategoria = { essencial: 0.00, opcional: 0.00, investimento: 0.00 };
    
    transacoes.forEach(t => {
        gastoTotal += t.valor;
        if (gastosPorCategoria[t.categoria] !== undefined) {
            gastosPorCategoria[t.categoria] += t.valor;
        }
    });
}

// --- Funções de Dados (Agora Assíncronas) ---

export async function loadData() {
    try {
        // Tenta carregar do backend
        const dadosBackend = await API.fetchTransacoes();
        transacoes = dadosBackend || [];
        
        // Renda ainda pode vir do localStorage se o backend não tiver endpoint pra isso
        // Ou você pode adaptar para salvar a renda no backend também
        const rendaSalva = localStorage.getItem(`renda_${currentUser}`);
        rendaTotal = rendaSalva ? parseFloat(rendaSalva) : 0.00;

        recalcularTotais();
        return { rendaTotal, transacoes };
    } catch (error) {
        console.warn('Backend indisponível, usando dados locais ou vazio:', error);
        // Fallback ou estado vazio
        return { rendaTotal, transacoes };
    }
}

export function setRendaTotal(renda) {
    rendaTotal = renda;
    if (currentUser) {
        localStorage.setItem(`renda_${currentUser}`, renda);
    }
}

export async function addTransaction(despesa) {
    try {
        // Envia para API
        const novaDespesa = await API.createTransacao(despesa);
        
        // Atualiza estado local com a resposta (que deve ter o ID real do banco)
        transacoes.unshift(novaDespesa);
        recalcularTotais();
        return novaDespesa;
    } catch (error) {
        console.error('Erro ao adicionar transação:', error);
        throw error;
    }
}

export async function removeTransaction(id) {
    try {
        await API.deleteTransacao(id);
        
        const index = transacoes.findIndex(t => t.id === id);
        if (index > -1) {
            transacoes.splice(index, 1);
            recalcularTotais();
            return true;
        }
        return false;
    } catch (error) {
        console.error('Erro ao remover transação:', error);
        return false;
    }
}

export async function updateTransaction(id, novaDescricao, novoValor, novaCategoria) {
    try {
        const transacaoAtualizada = {
            descricao: novaDescricao,
            valor: novoValor,
            categoria: novaCategoria
        };

        await API.updateTransacao(id, transacaoAtualizada);

        // Atualiza localmente
        const index = transacoes.findIndex(t => t.id === id);
        if (index > -1) {
            transacoes[index] = { ...transacoes[index], ...transacaoAtualizada };
            recalcularTotais();
            return transacoes[index];
        }
        return null;
    } catch (error) {
        console.error('Erro ao atualizar transação:', error);
        return null;
    }
}

export function resetTransactionData() {
    // Isso precisaria de um endpoint de "delete all" no backend ou um loop
    // Por segurança, vamos apenas limpar localmente por enquanto ou implementar loop
    transacoes = [];
    recalcularTotais();
    // TODO: Implementar limpeza no backend se necessário
}

// --- Autenticação ---
export function setCurrentUser(user) {
    currentUser = user;
    localStorage.setItem(CURRENT_USER_KEY, user);
}
