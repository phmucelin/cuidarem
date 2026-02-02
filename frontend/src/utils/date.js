/**
 * Converte string de data da API (ex: "2025-02-01T00:00:00Z") em Date no fuso local.
 * A API envia meia-noite UTC, o que no Brasil (UTC-3) vira o dia anterior.
 * Aqui tratamos como "só data" (dia civil) para exibir corretamente.
 */
export function parseLocalDate(dateString) {
    if (!dateString) return new Date(NaN);
    const s = String(dateString).split('T')[0];
    if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(dateString);
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
}
