// js/modules/api.js

// URL do backend (ajuste conforme necessário)
const API_URL = "http://localhost:3000/api/transacoes";
const AUTH_URL = "http://localhost:3000/auth/login";

// Token de autenticação
let token = localStorage.getItem("token");

export function setToken(newToken) {
    token = newToken;
    if (token) {
        localStorage.setItem("token", token);
    } else {
        localStorage.removeItem("token");
    }
}

export function getToken() {
    return token;
}

// --- Funções de Transações ---

export async function fetchTransacoes() {
    try {
        const response = await fetch(API_URL, {
            headers: {
                "Authorization": "Bearer " + token
            }
        });
        if (!response.ok) throw new Error('Falha ao buscar transações');
        return await response.json();
    } catch (erro) {
        console.error("Erro ao carregar:", erro);
        throw erro;
    }
}

export async function createTransacao(transacao) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify(transacao)
        });
        if (!response.ok) throw new Error('Falha ao criar transação');
        return await response.json();
    } catch (erro) {
        console.error("Erro ao salvar:", erro);
        throw erro;
    }
}

export async function updateTransacao(id, transacao) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify(transacao)
        });
        if (!response.ok) throw new Error('Falha ao atualizar transação');
        return await response.json();
    } catch (erro) {
        console.error("Erro ao atualizar:", erro);
        throw erro;
    }
}

export async function deleteTransacao(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + token
            }
        });
        if (!response.ok) throw new Error('Falha ao deletar transação');
        return true;
    } catch (erro) {
        console.error("Erro ao deletar:", erro);
        throw erro;
    }
}

// --- Funções de Autenticação (Exemplo) ---

export async function loginUser(email, password) {
    try {
        const response = await fetch(AUTH_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        
        if (!response.ok) throw new Error('Login falhou');
        
        const data = await response.json();
        setToken(data.token); // Salva o token
        return data.user; // Retorna dados do usuário
    } catch (erro) {
        console.error("Erro no login:", erro);
        throw erro;
    }
}
