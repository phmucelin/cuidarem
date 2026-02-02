import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import Input from '../../components/Input';
import '../Login/Login.css';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        password: '',
        confirmPassword: '',
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

        if (formData.password !== formData.confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }

        if (formData.password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await register(formData.nome, formData.email, formData.password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Erro ao criar conta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            {/* Background removido */}

            <div className="auth-container">
                <div className="auth-header">
                    <img src="/logo.png" alt="CuidaBem" className="auth-logo" />
                    <h1 className="auth-title">
                        <span className="text-navy">Cuida</span>
                        <span className="text-green">Bem</span>
                    </h1>
                    <p className="auth-subtitle">Crie sua conta e comece a cuidar</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <h2 className="form-title">Criar Conta</h2>

                    {error && (
                        <div className="auth-error">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}

                    <Input
                        label="Nome"
                        type="text"
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                        placeholder="Seu nome completo"
                        required
                        icon={User}
                    />

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
                        placeholder="Mínimo 6 caracteres"
                        required
                        icon={Lock}
                    />

                    <Input
                        label="Confirmar Senha"
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Repita a senha"
                        required
                        icon={Lock}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        loading={loading}
                        size="lg"
                    >
                        Criar Conta
                    </Button>

                    <p className="auth-link-text">
                        Já tem uma conta?{' '}
                        <Link to="/login" className="auth-link">Entrar</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;
