import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    AlertCircle,
    Coffee,
    Apple,
    UtensilsCrossed,
    Soup,
    Moon,
    Clock,
    Syringe,
    AlertTriangle,
    Phone,
    MessageCircle
} from 'lucide-react';
import { registrosApi, orientacoesApi, TIPOS_REFEICAO } from '../../services/api';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Card from '../../components/Card';
import './NovoRegistro.css';

const NovoRegistro = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        refeicao: 1,
        data: new Date().toISOString().split('T')[0],
        horaAntes: '',
        horaDepois: '',
        hgtAntes: '',
        hgtDepois: '',
        doseLentaAnte: '0',
        doseRapida: '0',
        temperatura: '',
        saturacao: '',
        pressaoSistolica: '',
        pressaoDiastolica: '',
        observacao: '',
    });
    const [medicamentos, setMedicamentos] = useState([]);
    const [medicamentosSelecionados, setMedicamentosSelecionados] = useState([]);
    const [insulinaInfo, setInsulinaInfo] = useState(null);

    useEffect(() => {
        const carregarMedicamentos = async () => {
            try {
                const meds = await registrosApi.obterMedicamentos(formData.refeicao);
                setMedicamentos(meds);
                setMedicamentosSelecionados([]);
            } catch (err) {
                console.error('Erro ao carregar medicamentos:', err);
            }
        };

        carregarMedicamentos();
    }, [formData.refeicao]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        setError('');

        if (name === 'hgtAntes' && value) {
            calcularDoseInsulina(parseInt(value));
        }
    };

    const calcularDoseInsulina = async (hgt) => {
        if (!hgt || hgt < 50 || hgt > 600) {
            setInsulinaInfo(null);
            return;
        }

        try {
            const resultado = await orientacoesApi.calcularDosagemInsulina(hgt);
            setInsulinaInfo(resultado);

            if (resultado.aplicar && resultado.doseRecomendada > 0) {
                setFormData(prev => ({
                    ...prev,
                    doseRapida: resultado.doseRecomendada.toString()
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    doseRapida: '0'
                }));
            }
        } catch (err) {
            console.error('Erro ao calcular dose de insulina:', err);
        }
    };

    const toggleMedicamento = (medicamento) => {
        setMedicamentosSelecionados(prev => {
            if (prev.includes(medicamento)) {
                return prev.filter(m => m !== medicamento);
            } else {
                return [...prev, medicamento];
            }
        });
    };

    const toggleTodosMedicamentos = () => {
        if (medicamentosSelecionados.length === medicamentos.length) {
            setMedicamentosSelecionados([]);
        } else {
            setMedicamentosSelecionados([...medicamentos]);
        }
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

        setLoading(true);
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
                temperatura: parseFloat(formData.temperatura) || 0,
                saturacao: parseInt(formData.saturacao) || 0,
                pressaoSistolica: parseInt(formData.pressaoSistolica) || 0,
                pressaoDiastolica: parseInt(formData.pressaoDiastolica) || 0,
                observacao: formData.observacao || null,
                medicamentosTomados: medicamentosSelecionados,
                cuidadorId: 0,
            };

            await registrosApi.criar(payload);
            navigate('/registros');
        } catch (err) {
            setError(err.message || 'Erro ao criar registro');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="novo-registro-page">
            <header className="page-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} style={{ marginRight: 5 }} /> Voltar
                </button>
                <h1 className="page-title">Novo Registro</h1>
            </header>

            <form className="registro-form" onSubmit={handleSubmit}>
                {error && (
                    <div className="form-error">
                        <AlertCircle size={20} /> {error}
                    </div>
                )}

                {/* Tipo de Refeição */}
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

                {/* Data e Horários */}
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
                                icon={Clock}
                                value={formData.horaAntes}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                label="Hora Depois"
                                type="time"
                                name="horaDepois"
                                icon={Clock}
                                value={formData.horaDepois}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </Card>
                </section>

                {/* Glicemia */}
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
                                placeholder="Ex: 120"
                                min="1"
                                max="600"
                                required
                            />
                            <Input
                                label="HGT Depois (mg/dL)"
                                type="number"
                                name="hgtDepois"
                                value={formData.hgtDepois}
                                onChange={handleChange}
                                placeholder="Ex: 180"
                                min="1"
                                max="600"
                                required
                            />
                        </div>
                    </Card>
                </section>

                {/* Insulina */}
                <section className="form-section">
                    <h3 className="section-label">Insulina</h3>
                    <Card padding="md">
                        {/* Indicador de cálculo automático */}
                        {insulinaInfo && (
                            <div style={{
                                padding: '12px',
                                marginBottom: '16px',
                                borderRadius: '8px',
                                backgroundColor: insulinaInfo.alerta?.includes('CRÍTICO')
                                    ? 'rgba(239, 68, 68, 0.15)'
                                    : insulinaInfo.aplicar
                                        ? 'rgba(99, 102, 241, 0.1)'
                                        : 'rgba(107, 114, 128, 0.1)',
                                border: insulinaInfo.alerta?.includes('CRÍTICO')
                                    ? '2px solid #ef4444'
                                    : '1px solid transparent'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '8px'
                                }}>
                                    {insulinaInfo.alerta?.includes('CRÍTICO') ? (
                                        <AlertTriangle size={20} color="#ef4444" />
                                    ) : (
                                        <Syringe size={20} color="#6366f1" />
                                    )}
                                    <span style={{
                                        fontWeight: '600',
                                        color: insulinaInfo.alerta?.includes('CRÍTICO') ? '#ef4444' : '#6366f1'
                                    }}>
                                        {insulinaInfo.nomeInsulina}
                                    </span>
                                </div>
                                <p style={{
                                    margin: '0 0 8px 0',
                                    fontSize: '14px',
                                    color: 'var(--text-primary)'
                                }}>
                                    HGT: <strong>{insulinaInfo.hgtAtual}</strong> →
                                    Dose recomendada: <strong>{insulinaInfo.doseRecomendada} UI</strong>
                                    {!insulinaInfo.aplicar && ' (não aplicar)'}
                                </p>
                                {insulinaInfo.alerta && (
                                    <p style={{
                                        margin: 0,
                                        fontSize: '13px',
                                        color: insulinaInfo.alerta.includes('CRÍTICO') ? '#ef4444' : '#f59e0b',
                                        fontWeight: '500'
                                    }}>
                                        {insulinaInfo.alerta}
                                    </p>
                                )}

                                {/* Contato de Emergência com telefone e botões */}
                                {insulinaInfo.contatoEmergencia && insulinaInfo.telefoneEmergencia && (
                                    <div style={{
                                        marginTop: '12px',
                                        padding: '10px',
                                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                        borderRadius: '8px'
                                    }}>
                                        <p style={{
                                            margin: '0 0 8px 0',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: 'var(--text-primary)'
                                        }}>
                                            {insulinaInfo.contatoEmergencia}
                                        </p>
                                        <p style={{
                                            margin: '0 0 10px 0',
                                            fontSize: '14px',
                                            color: 'var(--text-secondary)'
                                        }}>
                                            {insulinaInfo.telefoneEmergencia}
                                        </p>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <a
                                                href={`tel:${insulinaInfo.telefoneEmergencia.replace(/[^\d+]/g, '')}`}
                                                style={{
                                                    flex: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '6px',
                                                    padding: '10px',
                                                    backgroundColor: '#ef4444',
                                                    color: 'white',
                                                    borderRadius: '8px',
                                                    textDecoration: 'none',
                                                    fontWeight: '600',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                <Phone size={16} />
                                                Ligar
                                            </a>
                                            <a
                                                href={`https://wa.me/55${insulinaInfo.telefoneEmergencia.replace(/[^\d]/g, '')}?text=${encodeURIComponent(
                                                    `Olá Dr. Fernando,\n\n` +
                                                    `Estou entrando em contato sobre o Gastao Mucelin.\n\n` +
                                                    `Alerta: ${(insulinaInfo.alerta || 'Glicemia Muito Alta').replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]/gu, '').trim()}\n` +
                                                    `Detalhes: HGT ${insulinaInfo.hgtAtual} mg/dL\n` +
                                                    `Data: ${new Date().toLocaleDateString('pt-BR')}\n\n` +
                                                    `Preciso de orientação.`
                                                )}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    flex: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '6px',
                                                    padding: '10px',
                                                    backgroundColor: '#25D366',
                                                    color: 'white',
                                                    borderRadius: '8px',
                                                    textDecoration: 'none',
                                                    fontWeight: '600',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                <MessageCircle size={16} />
                                                WhatsApp
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="form-row two-cols">
                            <Input
                                label="Dose Lenta (unidades)"
                                type="number"
                                name="doseLentaAnte"
                                value={formData.doseLentaAnte}
                                onChange={handleChange}
                                placeholder="0"
                                min="0"
                                max="100"
                            />
                            <Input
                                label="Dose Rápida (unidades)"
                                type="number"
                                name="doseRapida"
                                value={formData.doseRapida}
                                onChange={handleChange}
                                placeholder="0"
                                min="0"
                                max="100"
                            />
                        </div>
                    </Card>
                </section>

                {/* Sinais Vitais */}
                <section className="form-section">
                    <h3 className="section-label">Sinais Vitais</h3>
                    <Card padding="md">
                        <div className="form-row two-cols">
                            <Input
                                label="Pressão Sistólica (mmHg)"
                                type="number"
                                name="pressaoSistolica"
                                value={formData.pressaoSistolica}
                                onChange={handleChange}
                                placeholder="Ex: 120"
                                min="0"
                                max="300"
                            />
                            <Input
                                label="Pressão Diastólica (mmHg)"
                                type="number"
                                name="pressaoDiastolica"
                                value={formData.pressaoDiastolica}
                                onChange={handleChange}
                                placeholder="Ex: 80"
                                min="0"
                                max="200"
                            />
                        </div>
                        <div className="form-row two-cols">
                            <Input
                                label="Saturação (%)"
                                type="number"
                                name="saturacao"
                                value={formData.saturacao}
                                onChange={handleChange}
                                placeholder="Ex: 98"
                                min="0"
                                max="100"
                            />
                            <Input
                                label="Temperatura (°C)"
                                type="number"
                                name="temperatura"
                                value={formData.temperatura}
                                onChange={handleChange}
                                placeholder="Ex: 36.5"
                                step="0.1"
                                min="0"
                                max="45"
                            />
                        </div>
                    </Card>
                </section>

                {/* Medicamentos */}
                <section className="form-section">
                    <h3 className="section-label">Medicamentos</h3>
                    <Card padding="md">
                        {medicamentos.length > 0 ? (
                            <>
                                <div style={{ marginBottom: '16px' }}>
                                    <button
                                        type="button"
                                        onClick={toggleTodosMedicamentos}
                                        className="btn-secondary"
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: medicamentosSelecionados.length === medicamentos.length ? '#10b981' : '#6366f1',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: '500'
                                        }}
                                    >
                                        {medicamentosSelecionados.length === medicamentos.length ? '✓ Todos Selecionados' : 'Selecionar Todos'}
                                    </button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {medicamentos.map((med, index) => (
                                        <label
                                            key={index}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '12px',
                                                backgroundColor: medicamentosSelecionados.includes(med) ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                border: '1px solid',
                                                borderColor: medicamentosSelecionados.includes(med) ? '#6366f1' : '#e5e7eb'
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={medicamentosSelecionados.includes(med)}
                                                onChange={() => toggleMedicamento(med)}
                                                style={{
                                                    width: '20px',
                                                    height: '20px',
                                                    marginRight: '12px',
                                                    cursor: 'pointer'
                                                }}
                                            />
                                            <span style={{ fontSize: '15px', fontWeight: '500' }}>{med}</span>
                                        </label>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p style={{ color: '#6b7280', textAlign: 'center' }}>Nenhum medicamento cadastrado para esta refeição</p>
                        )}
                    </Card>
                </section>

                {/* Observação */}
                <section className="form-section">
                    <h3 className="section-label">Observações</h3>
                    <Card padding="md">
                        <textarea
                            className="textarea-field"
                            name="observacao"
                            value={formData.observacao}
                            onChange={handleChange}
                            placeholder="Alguma observação sobre esta refeição? (opcional)"
                            rows={3}
                        />
                    </Card>
                </section>

                {/* Submit */}
                <div className="form-actions">
                    <Button
                        type="submit"
                        fullWidth
                        size="lg"
                        loading={loading}
                    >
                        Salvar Registro
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default NovoRegistro;
