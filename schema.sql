CREATE DATABASE IF NOT EXISTS uninerd_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE uninerd_db;

CREATE TABLE IF NOT EXISTS especialidades (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_especialidade_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT NOT NULL AUTO_INCREMENT,
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL,
  senha VARCHAR(255) NOT NULL,
  cpf VARCHAR(11) NULL,
  endereco VARCHAR(255) NULL,
  crm_numero VARCHAR(30) NULL,
  crm_uf CHAR(2) NULL,
  id_especialidade INT UNSIGNED NULL,
  foto_url VARCHAR(2048) NULL,
  biografia TEXT NULL,
  agenda_configurada TINYINT(1) NOT NULL DEFAULT 0,
  nivel ENUM('medico', 'paciente', 'admin') NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_usuario_email (email),
  UNIQUE KEY uk_usuario_cpf (cpf),
  UNIQUE KEY uk_usuario_crm (crm_numero, crm_uf),
  CONSTRAINT fk_usuario_especialidade
    FOREIGN KEY (id_especialidade) REFERENCES especialidades(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS horarios_medicos (
  id INT NOT NULL AUTO_INCREMENT,
  id_medico INT NOT NULL,
  dia_semana TINYINT UNSIGNED NOT NULL,
  horario TIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_horario_medico (id_medico, dia_semana, horario),
  CONSTRAINT fk_horario_medico
    FOREIGN KEY (id_medico) REFERENCES usuarios(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT chk_dia_semana CHECK (dia_semana BETWEEN 0 AND 6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS agendamentos (
  id INT NOT NULL AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  id_medico INT NOT NULL,
  data_consulta DATETIME NOT NULL,
  tipo ENUM('consulta', 'exame') NOT NULL DEFAULT 'consulta',
  status ENUM('AGENDADO', 'CONFIRMADO', 'CONCLUIDO', 'CANCELADO') NOT NULL DEFAULT 'AGENDADO',
  motivo_cancelamento VARCHAR(500) NULL,
  cancelado_por INT NULL,
  arquivo_cancelamento VARCHAR(512) NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  horario_ativo DATETIME GENERATED ALWAYS AS (
    CASE WHEN status <> 'CANCELADO' THEN data_consulta ELSE NULL END
  ) STORED,
  PRIMARY KEY (id),
  UNIQUE KEY uk_agendamento_medico_ativo (id_medico, horario_ativo),
  UNIQUE KEY uk_agendamento_paciente_ativo (id_usuario, horario_ativo),
  KEY idx_agendamento_data (data_consulta),
  CONSTRAINT fk_agendamento_paciente
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_agendamento_medico
    FOREIGN KEY (id_medico) REFERENCES usuarios(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_agendamento_cancelador
    FOREIGN KEY (cancelado_por) REFERENCES usuarios(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO especialidades (nome) VALUES
  ('Cardiologia'),
  ('Clínica Médica'),
  ('Dermatologia'),
  ('Endocrinologia'),
  ('Ginecologia'),
  ('Neurologia'),
  ('Oftalmologia'),
  ('Ortopedia'),
  ('Pediatria'),
  ('Psiquiatria');
