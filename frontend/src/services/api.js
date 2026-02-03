const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5178';

// Helper para fazer requests com autenticação
const request = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');

    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Se token expirou ou inválido
    if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        throw new Error('Sessão expirada. Faça login novamente.');
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(data?.message || 'Erro na requisição');
    }

    return data;
};

// ============ AUTH ============

export const authApi = {
    login: async (email, password) => {
        const data = await request('/api/cuidadores/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        return data;
    },

    register: async (nome, email, password) => {
        const data = await request('/api/cuidadores/registro', {
            method: 'POST',
            body: JSON.stringify({
                nome,
                email,
                hashPassword: password
            }),
        });

        // Salvar token e dados do usuário
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        return data;
    },

    getMe: async () => {
        return request('/api/cuidadores/me');
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },

    getUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
};

// ============ REGISTROS ============

export const registrosApi = {
    listar: async () => {
        return request('/api/registros');
    },

    obter: async (id) => {
        return request(`/api/registros/${id}`);
    },

    criar: async (registro) => {
        return request('/api/registros', {
            method: 'POST',
            body: JSON.stringify(registro),
        });
    },

    atualizar: async (id, registro) => {
        return request(`/api/registros/${id}`, {
            method: 'PUT',
            body: JSON.stringify(registro),
        });
    },

    deletar: async (id) => {
        return request(`/api/registros/${id}`, {
            method: 'DELETE',
        });
    },

    obterMedicamentos: async (refeicao) => {
        return request(`/api/registros/medicamentos/${refeicao}`);
    },
};

// ============ RELATÓRIOS ============

export const relatorioApi = {
    getIndividual: async (cuidadorId, inicio, fim) => {
        const query = new URLSearchParams({
            inicio: inicio.toISOString(),
            fim: fim.toISOString(),
        }).toString();

        return request(`/api/Relatorio/individual/${cuidadorId}?${query}`);
    },

    getGeral: async (inicio, fim) => {
        const query = new URLSearchParams({
            inicio: inicio.toISOString(),
            fim: fim.toISOString(),
        }).toString();

        return request(`/api/Relatorio/geral?${query}`);
    }
};

// ============ FAMÍLIA/ADMIN ============

export const familiaApi = {
    listarCuidadores: async () => {
        return request('/api/cuidadores/todos');
    },

    getRelatorioCuidador: async (cuidadorId, inicio, fim) => {
        const query = new URLSearchParams({
            inicio: inicio.toISOString(),
            fim: fim.toISOString(),
        }).toString();
        return request(`/api/Relatorio/individual/${cuidadorId}?${query}`);
    },

    getRelatorioGeral: async (inicio, fim) => {
        const query = new URLSearchParams({
            inicio: inicio.toISOString(),
            fim: fim.toISOString(),
        }).toString();
        return request(`/api/Relatorio/geral?${query}`);
    },
};

// Tipos de refeição
export const TIPOS_REFEICAO = {
    1: { label: 'Café da Manhã', color: 'var(--color-orange)' },
    2: { label: 'Lanche', color: 'var(--color-green)' },
    3: { label: 'Almoço', color: 'var(--color-coral)' },
    4: { label: 'Jantar', color: 'var(--color-blue)' },
    5: { label: 'Madrugada', color: 'var(--color-navy)' },
};

export default { authApi, registrosApi, relatorioApi, familiaApi, TIPOS_REFEICAO };
