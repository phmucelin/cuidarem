import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Users, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import Input from '../../components/Input';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [tipoLogin, setTipoLogin] = useState('cuidador'); // 'cuidador' ou 'familia'

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await login(formData.email, formData.password);
            // Redirecionar baseado no tipo de usuário
            if (data.user.tipo === 1) { // Familia
                navigate('/admin/dashboard');
            } else { // Cuidador
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.message || 'Erro ao fazer login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            {/* Background decorativo removido conforme solicitado */}

            <div className="auth-container">
                <div className="auth-header">
                    <img src="/logo.png" alt="CuidaBem" className="auth-logo" />
                    <h1 className="auth-title">
                        <span className="text-navy">Cuida</span>
                        <span className="text-green">Bem</span>
                    </h1>
                    <p className="auth-subtitle">Cuidando do vó e da vó, todos os dias.</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <h2 className="form-title">Entrar</h2>

                    {/* Seleção de tipo de login */}
                    <div style={{
                        display: 'flex',
                        gap: '8px',
                        marginBottom: '20px',
                        background: 'var(--bg-input)',
                        padding: '4px',
                        borderRadius: '12px',
                    }}>
                        <button
                            type="button"
                            onClick={() => setTipoLogin('cuidador')}
                            style={{
                                flex: 1,
                                padding: '10px',
                                border: 'none',
                                borderRadius: '8px',
                                background: tipoLogin === 'cuidador' ? 'var(--color-coral)' : 'transparent',
                                color: tipoLogin === 'cuidador' ? 'white' : 'var(--text-secondary)',
                                fontWeight: tipoLogin === 'cuidador' ? 600 : 400,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'all 0.2s',
                            }}
                        >
                            <User size={18} />
                            Cuidador
                        </button>
                        <button
                            type="button"
                            onClick={() => setTipoLogin('familia')}
                            style={{
                                flex: 1,
                                padding: '10px',
                                border: 'none',
                                borderRadius: '8px',
                                background: tipoLogin === 'familia' ? 'var(--color-coral)' : 'transparent',
                                color: tipoLogin === 'familia' ? 'white' : 'var(--text-secondary)',
                                fontWeight: tipoLogin === 'familia' ? 600 : 400,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'all 0.2s',
                            }}
                        >
                            <Users size={18} />
                            Família
                        </button>
                    </div>

                    {error && (
                        <div className="auth-error">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}

                    <Input
                        label="Email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="seu@email.com"
                        required
                        icon={Mail}
                    />

                    <Input
                        label="Senha"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                        icon={Lock}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        loading={loading}
                        size="lg"
                    >
                        Entrar
                    </Button>

                    <p className="auth-link-text">
                        Não tem uma conta?{' '}
                        <Link to="/register" className="auth-link">Cadastre-se</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
