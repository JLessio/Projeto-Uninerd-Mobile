SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS especialidades (
  id INT NOT NULL AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL UNIQUE,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT NOT NULL AUTO_INCREMENT,
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) NULL UNIQUE,
  endereco VARCHAR(255) NULL,
  crm_numero VARCHAR(20) NULL UNIQUE,
  crm_uf CHAR(2) NULL,
  id_especialidade INT NULL,
  nivel ENUM('admin', 'medico', 'paciente') NOT NULL DEFAULT 'paciente',
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_usuario_especialidade
    FOREIGN KEY (id_especialidade) REFERENCES especialidades(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS agendamentos (
  id INT NOT NULL AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  id_medico INT NOT NULL,
  data_consulta DATETIME NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  status ENUM('AGENDADO', 'PENDENTE', 'CONFIRMADO', 'CANCELADO', 'CONCLUIDO') NOT NULL DEFAULT 'AGENDADO',
  observacoes TEXT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_agendamento_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_agendamento_medico
    FOREIGN KEY (id_medico) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_agendamento_medico_data (id_medico, data_consulta),
  INDEX idx_agendamento_usuario_data (id_usuario, data_consulta)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS horarios_medicos (
  id INT NOT NULL AUTO_INCREMENT,
  id_medico INT NOT NULL,
  dia_semana TINYINT UNSIGNED NOT NULL,
  horario TIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_horario_medico (id_medico, dia_semana, horario),
  CONSTRAINT fk_horario_medico FOREIGN KEY (id_medico) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT chk_dia_semana CHECK (dia_semana BETWEEN 0 AND 6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO especialidades (nome) VALUES
  ('Cardiologia'),
  ('Clínica Geral'),
  ('Dermatologia'),
  ('Pediatria');
