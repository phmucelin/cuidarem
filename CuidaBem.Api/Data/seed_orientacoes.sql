-- ===============================================
-- SEED DATA - Orientações Médicas CuidaBem
-- Baseado no PDF de orientações médicas
-- ===============================================

-- Limpar dados existentes (se necessário)
-- TRUNCATE TABLE medicamento_horarios, insulina_dosagens, medicamentos, procedimentos_recorrentes RESTART IDENTITY CASCADE;

-- ===============================================
-- CAIXINHA 1 - CAFÉ DA MANHÃ
-- ===============================================

INSERT INTO "Medicamentos" ("Nome", "Dosagem", "Unidade", "Tipo", "Instrucoes", "CriadoEm") VALUES
('Pantoprazol', '40mg', 'CP', 'Oral', NULL, NOW()),
('Ezetimiba', '10mg', 'CP', 'Oral', NULL, NOW()),
('Xarelto', '2,5mg', 'CP', 'Oral', NULL, NOW()),
('Bisoprolol', '1,25mg', 'CP', 'Oral', NULL, NOW()),
('Velija', '30mg', 'CP', 'Oral', NULL, NOW()),
('Celabrat', '100mg', 'CP', 'Oral', NULL, NOW()),
('Primid', '100mg', 'CP', 'Oral', NULL, NOW()),
('Azitromicina', '500mg', 'CP', 'Oral', 'Tomar apenas Segunda, Quarta e Sexta', NOW());

-- Horários Café da Manhã (08:00) - Todos os dias
INSERT INTO "MedicamentoHorarios" ("MedicamentoId", "Horario", "DiasSemana", "ContextoRefeicao", "AntesOuDepois", "Ativo")
SELECT "Id", '08:00:00'::time, ARRAY[0,1,2,3,4,5,6], 'CAFE', 'ANTES', true
FROM "Medicamentos" WHERE "Nome" IN ('Pantoprazol', 'Ezetimiba', 'Xarelto', 'Bisoprolol', 'Velija', 'Celabrat');

-- Primid - Café da manhã
INSERT INTO "MedicamentoHorarios" ("MedicamentoId", "Horario", "DiasSemana", "ContextoRefeicao", "AntesOuDepois", "Ativo")
SELECT "Id", '08:00:00'::time, ARRAY[0,1,2,3,4,5,6], 'CAFE', 'ANTES', true
FROM "Medicamentos" WHERE "Nome" = 'Primid';

-- Azitromicina - Segunda (1), Quarta (3), Sexta (5)
INSERT INTO "MedicamentoHorarios" ("MedicamentoId", "Horario", "DiasSemana", "ContextoRefeicao", "AntesOuDepois", "Ativo")
SELECT "Id", '08:00:00'::time, ARRAY[1,3,5], 'CAFE', 'ANTES', true
FROM "Medicamentos" WHERE "Nome" = 'Azitromicina';

-- ===============================================
-- JANTAR
-- ===============================================

INSERT INTO "Medicamentos" ("Nome", "Dosagem", "Unidade", "Tipo", "Instrucoes", "CriadoEm") VALUES
('Cebralat', '100mg', 'CP', 'Oral', NULL, NOW()),
('Lyrica', '75mg', 'CP', 'Oral', NULL, NOW()),
('Crestor (Rosuvastatina)', '20mg', 'CP', 'Oral', NULL, NOW()),
('Duomo', '2mg', 'CP', 'Oral', NULL, NOW()),
('Bissulfato de Clopidogrel', '75mg', 'CP', 'Oral', NULL, NOW()),
('Neutrofer', '300mg', 'CP', 'Oral', NULL, NOW());

-- Primid também no jantar (já existe, buscar ID)
INSERT INTO "MedicamentoHorarios" ("MedicamentoId", "Horario", "DiasSemana", "ContextoRefeicao", "AntesOuDepois", "Ativo")
SELECT "Id", '18:00:00'::time, ARRAY[0,1,2,3,4,5,6], 'JANTAR', 'ANTES', true
FROM "Medicamentos" WHERE "Nome" = 'Primid';

-- Horários Jantar (18:00) - Todos os dias
INSERT INTO "MedicamentoHorarios" ("MedicamentoId", "Horario", "DiasSemana", "ContextoRefeicao", "AntesOuDepois", "Ativo")
SELECT "Id", '18:00:00'::time, ARRAY[0,1,2,3,4,5,6], 'JANTAR', 'ANTES', true
FROM "Medicamentos" WHERE "Nome" IN ('Cebralat', 'Lyrica', 'Crestor (Rosuvastatina)', 'Duomo', 'Bissulfato de Clopidogrel', 'Neutrofer');

-- ===============================================
-- CAIXINHA 2 - GLIFAGE (DEPOIS das refeições)
-- ===============================================

INSERT INTO "Medicamentos" ("Nome", "Dosagem", "Unidade", "Tipo", "Instrucoes", "CriadoEm") VALUES
('Glifage XR', '500mg', 'CP', 'Oral', 'Tomar DEPOIS da refeição', NOW());

-- Glifage após Almoço e Jantar
INSERT INTO "MedicamentoHorarios" ("MedicamentoId", "Horario", "DiasSemana", "ContextoRefeicao", "AntesOuDepois", "Ativo")
SELECT "Id", '12:30:00'::time, ARRAY[0,1,2,3,4,5,6], 'ALMOCO', 'DEPOIS', true
FROM "Medicamentos" WHERE "Nome" = 'Glifage XR';

INSERT INTO "MedicamentoHorarios" ("MedicamentoId", "Horario", "DiasSemana", "ContextoRefeicao", "AntesOuDepois", "Ativo")
SELECT "Id", '18:30:00'::time, ARRAY[0,1,2,3,4,5,6], 'JANTAR', 'DEPOIS', true
FROM "Medicamentos" WHERE "Nome" = 'Glifage XR';

-- ===============================================
-- CAIXINHA 3 - 20h (Seroquel + Donaren)
-- ===============================================

INSERT INTO "Medicamentos" ("Nome", "Dosagem", "Unidade", "Tipo", "Instrucoes", "CriadoEm") VALUES
('Seroquel', '50mg', 'CP', 'Oral', 'Administrar às 20h junto com Donaren', NOW()),
('Donaren', '50mg', 'CP', 'Oral', 'Administrar às 20h junto com Seroquel', NOW());

INSERT INTO "MedicamentoHorarios" ("MedicamentoId", "Horario", "DiasSemana", "ContextoRefeicao", "AntesOuDepois", "Ativo")
SELECT "Id", '20:00:00'::time, ARRAY[0,1,2,3,4,5,6], NULL, 'ANTES', true
FROM "Medicamentos" WHERE "Nome" IN ('Seroquel', 'Donaren');

-- ===============================================
-- MUVINLAX - Lanche da Tarde (15h/16h)
-- ===============================================

INSERT INTO "Medicamentos" ("Nome", "Dosagem", "Unidade", "Tipo", "Instrucoes", "CriadoEm") VALUES
('Muvinlax', '1 Sache', 'Sache', 'Oral', 'Tomar depois do lanche da tarde', NOW());

INSERT INTO "MedicamentoHorarios" ("MedicamentoId", "Horario", "DiasSemana", "ContextoRefeicao", "AntesOuDepois", "Ativo")
SELECT "Id", '15:30:00'::time, ARRAY[0,1,2,3,4,5,6], 'LANCHE', 'DEPOIS', true
FROM "Medicamentos" WHERE "Nome" = 'Muvinlax';

-- ===============================================
-- INSULINAS
-- ===============================================

-- Insulina Glargilin (Lenta) - Doses FIXAS
INSERT INTO "Medicamentos" ("Nome", "Dosagem", "Unidade", "Tipo", "Instrucoes", "CriadoEm") VALUES
('Insulina Glargilin (Lenta)', '12UI/6UI', 'UI', 'Injetavel', 'Aplicação FIXA independente do HGT. Manhã: 12UI às 08:00. Jantar: 6UI às 18:00', NOW());

-- Glargilin Manhã - 12UI às 08:00
INSERT INTO "MedicamentoHorarios" ("MedicamentoId", "Horario", "DiasSemana", "ContextoRefeicao", "AntesOuDepois", "Ativo")
SELECT "Id", '08:00:00'::time, ARRAY[0,1,2,3,4,5,6], 'CAFE', 'ANTES', true
FROM "Medicamentos" WHERE "Nome" = 'Insulina Glargilin (Lenta)';

-- Glargilin Jantar - 6UI às 18:00
INSERT INTO "MedicamentoHorarios" ("MedicamentoId", "Horario", "DiasSemana", "ContextoRefeicao", "AntesOuDepois", "Ativo")
SELECT "Id", '18:00:00'::time, ARRAY[0,1,2,3,4,5,6], 'JANTAR', 'ANTES', true
FROM "Medicamentos" WHERE "Nome" = 'Insulina Glargilin (Lenta)';

-- Insulina Humalog (Rápida) - Doses VARIÁVEIS
INSERT INTO "Medicamentos" ("Nome", "Dosagem", "Unidade", "Tipo", "Instrucoes", "CriadoEm") VALUES
('Insulina Humalog (Rápida)', 'Variável', 'UI', 'Injetavel', 'Dose variável conforme HGT. EVITAR aplicar à noite!', NOW());

-- Dosagens variáveis Humalog
INSERT INTO "InsulinaDosagens" ("MedicamentoId", "HgtMinimo", "HgtMaximo", "DoseUi", "Aplicar", "AlertaCritico", "ContatoEmergencia", "TelefoneEmergencia")
SELECT "Id", 0, 160, 0, false, false, NULL, NULL
FROM "Medicamentos" WHERE "Nome" = 'Insulina Humalog (Rápida)';

INSERT INTO "InsulinaDosagens" ("MedicamentoId", "HgtMinimo", "HgtMaximo", "DoseUi", "Aplicar", "AlertaCritico", "ContatoEmergencia", "TelefoneEmergencia")
SELECT "Id", 161, 200, 4, true, false, NULL, NULL
FROM "Medicamentos" WHERE "Nome" = 'Insulina Humalog (Rápida)';

INSERT INTO "InsulinaDosagens" ("MedicamentoId", "HgtMinimo", "HgtMaximo", "DoseUi", "Aplicar", "AlertaCritico", "ContatoEmergencia", "TelefoneEmergencia")
SELECT "Id", 201, 240, 8, true, false, NULL, NULL
FROM "Medicamentos" WHERE "Nome" = 'Insulina Humalog (Rápida)';

INSERT INTO "InsulinaDosagens" ("MedicamentoId", "HgtMinimo", "HgtMaximo", "DoseUi", "Aplicar", "AlertaCritico", "ContatoEmergencia", "TelefoneEmergencia")
SELECT "Id", 241, 350, 10, true, false, NULL, NULL
FROM "Medicamentos" WHERE "Nome" = 'Insulina Humalog (Rápida)';

-- Alerta crítico HGT > 350
INSERT INTO "InsulinaDosagens" ("MedicamentoId", "HgtMinimo", "HgtMaximo", "DoseUi", "Aplicar", "AlertaCritico", "ContatoEmergencia", "TelefoneEmergencia")
SELECT "Id", 351, NULL, 10, true, true, 'Dr. Fernando Portela', '(21)99978-2547'
FROM "Medicamentos" WHERE "Nome" = 'Insulina Humalog (Rápida)';

-- ===============================================
-- NEBULIZAÇÃO
-- ===============================================

INSERT INTO "Medicamentos" ("Nome", "Dosagem", "Unidade", "Tipo", "Instrucoes", "CriadoEm") VALUES
('Atrovent (Nebulização)', '30 Gotas + 3ml Soro Fisiológico', 'Gotas', 'Nebulizacao', '2x ao dia - Após café da manhã e após jantar', NOW());

-- Nebulização manhã
INSERT INTO "MedicamentoHorarios" ("MedicamentoId", "Horario", "DiasSemana", "ContextoRefeicao", "AntesOuDepois", "Ativo")
SELECT "Id", '09:00:00'::time, ARRAY[0,1,2,3,4,5,6], 'CAFE', 'DEPOIS', true
FROM "Medicamentos" WHERE "Nome" = 'Atrovent (Nebulização)';

-- Nebulização noite
INSERT INTO "MedicamentoHorarios" ("MedicamentoId", "Horario", "DiasSemana", "ContextoRefeicao", "AntesOuDepois", "Ativo")
SELECT "Id", '19:00:00'::time, ARRAY[0,1,2,3,4,5,6], 'JANTAR', 'DEPOIS', true
FROM "Medicamentos" WHERE "Nome" = 'Atrovent (Nebulização)';

-- ===============================================
-- ANORO
-- ===============================================

INSERT INTO "Medicamentos" ("Nome", "Dosagem", "Unidade", "Tipo", "Instrucoes", "CriadoEm") VALUES
('Anoro', '1 Jato', 'Jato', 'Inalacao', 'Aspirar 1 jato, lavar a boca, fazer gargarejo e cuspir', NOW());

INSERT INTO "MedicamentoHorarios" ("MedicamentoId", "Horario", "DiasSemana", "ContextoRefeicao", "AntesOuDepois", "Ativo")
SELECT "Id", '08:30:00'::time, ARRAY[0,1,2,3,4,5,6], 'CAFE', 'DEPOIS', true
FROM "Medicamentos" WHERE "Nome" = 'Anoro';

-- ===============================================
-- PROCEDIMENTOS RECORRENTES
-- ===============================================

-- Epress - 7 em 7 dias por 4 semanas (a partir de 29/01/2026)
INSERT INTO "ProcedimentosRecorrentes" ("Nome", "Tipo", "IntervaloDias", "DataInicio", "DataFim", "Instrucoes", "Ativo") VALUES
('Epress 10.000 UI', 'InjecaoCiclo', 7, '2026-01-29', '2026-02-26', 'Aplicar 1 ampola de 7 em 7 dias por 4 semanas, após o jantar', true);

-- Sensor FreeStyle Libre - 14 em 14 dias
INSERT INTO "ProcedimentosRecorrentes" ("Nome", "Tipo", "IntervaloDias", "DataInicio", "DataFim", "Instrucoes", "Ativo") VALUES
('Sensor FreeStyle Libre', 'Sensor', 14, '2026-01-29', NULL, 'No 13º dia colocar no braço contrário. Aguardar indicação do medidor para acionar novo sensor. O leitor avisa 3 dias antes da expiração.', true);

-- ===============================================
-- FIM DO SEED
-- ===============================================

-- Verificar dados inseridos
SELECT 'Medicamentos: ' || COUNT(*) FROM "Medicamentos";
SELECT 'Horários: ' || COUNT(*) FROM "MedicamentoHorarios";
SELECT 'Dosagens Insulina: ' || COUNT(*) FROM "InsulinaDosagens";
SELECT 'Procedimentos: ' || COUNT(*) FROM "ProcedimentosRecorrentes";
