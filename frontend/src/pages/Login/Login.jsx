import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
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
            await login(formData.email, formData.password);
            navigate('/dashboard');
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
