import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Verificar se há usuário logado ao carregar
        const storedUser = authApi.getUser();

        if (storedUser && authApi.isAuthenticated()) {
            setUser(storedUser);
            setLoading(false);

            // DESABILITADO: validação automática causando loop de logout
            // authApi.getMe()
            //     .then(userData => {
            //         setUser(userData);
            //         localStorage.setItem('user', JSON.stringify(userData));
            //     })
            //     .catch((err) => {
            //         console.error('Erro ao validar token:', err);
            //         logout();
            //     })
            //     .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        setError(null);
        console.log('[AuthContext] Tentando login...');
        try {
            const data = await authApi.login(email, password);
            console.log('[AuthContext] Login concluído, setando user:', data.user);
            setUser(data.user);
            return data;
        } catch (err) {
            console.error('[AuthContext] Erro no login:', err);
            setError(err.message);
            throw err;
        }
    };

    const register = async (nome, email, password) => {
        setError(null);
        try {
            const data = await authApi.register(nome, email, password);
            setUser(data.user);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const logout = () => {
        setUser(null);
        authApi.logout();
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user && authApi.isAuthenticated(),
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};

export default AuthContext;
