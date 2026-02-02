import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    AlertCircle,
    Coffee,
    Apple,
    UtensilsCrossed,
    Soup,
    Moon
} from 'lucide-react';
import { registrosApi, TIPOS_REFEICAO } from '../../services/api';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Card from '../../components/Card';
import '../NovoRegistro/NovoRegistro.css'; // Reutilizando estilos

const EditarRegistro = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        refeicao: 1,
        data: '',
        horaAntes: '',
        horaDepois: '',
        hgtAntes: '',
        hgtDepois: '',
        doseLentaAnte: '',
        doseRapida: '',
        observacao: '',
    });

    useEffect(() => {
        loadRegistro();
    }, [id]);

    const loadRegistro = async () => {
        try {
            const data = await registrosApi.obter(id);

            // Formatar dados para o formulário
            setFormData({
                refeicao: data.refeicao,
                data: data.data.split('T')[0],
                horaAntes: data.horaAntes.slice(0, 5),
                horaDepois: data.horaDepois.slice(0, 5),
                hgtAntes: data.hgtAntes,
                hgtDepois: data.hgtDepois,
                doseLentaAnte: data.doseLentaAnte,
                doseRapida: data.doseRapida,
                observacao: data.observacao || '',
            });
        } catch (err) {
            setError('Erro ao carregar registro. Tente novamente.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        setError('');
    };

    const handleRefeicaoSelect = (tipo) => {
        setFormData(prev => ({
            ...prev,
            refeicao: parseInt(tipo),
        }));
    };

    const getMealIcon = (typeId) => {
        switch (parseInt(typeId)) {
            case 1: return <Coffee size={32} />;
            case 2: return <Apple size={32} />;
            case 3: return <UtensilsCrossed size={32} />;
            case 4: return <Soup size={32} />;
            case 5: return <Moon size={32} />;
            default: return <UtensilsCrossed size={32} />;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.horaAntes || !formData.horaDepois) {
            setError('Preencha os horários');
            return;
        }
        if (!formData.hgtAntes || !formData.hgtDepois) {
            setError('Preencha os valores de glicemia');
            return;
        }

        setSaving(true);
        setError('');

        try {
            const payload = {
                refeicao: formData.refeicao,
                data: formData.data,
                horaAntes: formData.horaAntes + ':00',
                horaDepois: formData.horaDepois + ':00',
                hgtAntes: parseInt(formData.hgtAntes),
                hgtDepois: parseInt(formData.hgtDepois),
                doseLentaAnte: parseInt(formData.doseLentaAnte) || 0,
                doseRapida: parseInt(formData.doseRapida) || 0,
                observacao: formData.observacao || null,
                cuidadorId: 0, // Backend ignora/sobrescreve
            };

            await registrosApi.atualizar(id, payload);
            navigate('/registros');
        } catch (err) {
            setError(err.message || 'Erro ao atualizar registro');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Carregando...</div>;

    return (
        <div className="novo-registro-page">
            <header className="page-header">
                <button className="back-btn" onClick={() => navigate('/registros')}>
                    <ArrowLeft size={24} style={{ marginRight: 5 }} /> Voltar
                </button>
                <h1 className="page-title">Editar Registro</h1>
            </header>

            <form className="registro-form" onSubmit={handleSubmit}>
                {error && (
                    <div className="form-error">
                        <AlertCircle size={20} /> {error}
                    </div>
                )}

                <section className="form-section">
                    <h3 className="section-label">Tipo de Refeição</h3>
                    <div className="refeicao-grid">
                        {Object.entries(TIPOS_REFEICAO).map(([key, value]) => (
                            <button
                                key={key}
                                type="button"
                                className={`refeicao-btn ${formData.refeicao === parseInt(key) ? 'active' : ''}`}
                                onClick={() => handleRefeicaoSelect(key)}
                                style={{ '--btn-color': value.color }}
                            >
                                <div className="refeicao-icon-wrapper">
                                    {getMealIcon(key)}
                                </div>
                                <span className="refeicao-label">{value.label}</span>
                            </button>
                        ))}
                    </div>
                </section>

                <section className="form-section">
                    <h3 className="section-label">Data e Horários</h3>
                    <Card padding="md">
                        <div className="form-row">
                            <Input
                                label="Data"
                                type="date"
                                name="data"
                                value={formData.data}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-row two-cols">
                            <Input
                                label="Hora Antes"
                                type="time"
                                name="horaAntes"
                                value={formData.horaAntes}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                label="Hora Depois"
                                type="time"
                                name="horaDepois"
                                value={formData.horaDepois}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </Card>
                </section>

                <section className="form-section">
                    <h3 className="section-label">Glicemia (HGT)</h3>
                    <Card padding="md">
                        <div className="form-row two-cols">
                            <Input
                                label="HGT Antes (mg/dL)"
                                type="number"
                                name="hgtAntes"
                                value={formData.hgtAntes}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                label="HGT Depois (mg/dL)"
                                type="number"
                                name="hgtDepois"
                                value={formData.hgtDepois}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </Card>
                </section>

                <section className="form-section">
                    <h3 className="section-label">Insulina</h3>
                    <Card padding="md">
                        <div className="form-row two-cols">
                            <Input
                                label="Dose Lenta (unidades)"
                                type="number"
                                name="doseLentaAnte"
                                value={formData.doseLentaAnte}
                                onChange={handleChange}
                            />
                            <Input
                                label="Dose Rápida (unidades)"
                                type="number"
                                name="doseRapida"
                                value={formData.doseRapida}
                                onChange={handleChange}
                            />
                        </div>
                    </Card>
                </section>

                <section className="form-section">
                    <h3 className="section-label">Observações</h3>
                    <Card padding="md">
                        <textarea
                            className="textarea-field"
                            name="observacao"
                            value={formData.observacao}
                            onChange={handleChange}
                            rows={3}
                        />
                    </Card>
                </section>

                <div className="form-actions">
                    <Button
                        type="submit"
                        fullWidth
                        size="lg"
                        loading={saving}
                    >
                        Salvar Alterações
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default EditarRegistro;
