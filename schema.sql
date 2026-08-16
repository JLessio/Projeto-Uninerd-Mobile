-- Schema: Sistema de Agendamento Médico
-- Execute este script para criar as tabelas no banco de dados

CREATE DATABASE IF NOT EXISTS medical_scheduling
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE medical_scheduling;

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
  id        INT          NOT NULL AUTO_INCREMENT,
  nome      VARCHAR(150) NOT NULL,
  email     VARCHAR(255) NOT NULL UNIQUE,
  senha     VARCHAR(255) NOT NULL,
  cpf       VARCHAR(14)  NOT NULL UNIQUE,
  nivel     ENUM('admin', 'doctor', 'patient') NOT NULL DEFAULT 'patient',
  criado_em TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Médicos (placeholder para próximas implementações)
CREATE TABLE IF NOT EXISTS doctors (
  id              INT          NOT NULL AUTO_INCREMENT,
  user_id         INT          NOT NULL,
  especialidade   VARCHAR(100) NOT NULL,
  crm             VARCHAR(20)  NOT NULL UNIQUE,
  PRIMARY KEY (id),
  CONSTRAINT fk_doctor_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Agendamentos (placeholder para próximas implementações)
CREATE TABLE IF NOT EXISTS appointments (
  id          INT       NOT NULL AUTO_INCREMENT,
  patient_id  INT       NOT NULL,
  doctor_id   INT       NOT NULL,
  data_hora   DATETIME  NOT NULL,
  status      ENUM('pending', 'confirmed', 'cancelled', 'completed') NOT NULL DEFAULT 'pending',
  observacoes TEXT,
  criado_em   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_appointment_patient FOREIGN KEY (patient_id) REFERENCES users(id)   ON DELETE CASCADE,
  CONSTRAINT fk_appointment_doctor  FOREIGN KEY (doctor_id)  REFERENCES doctors(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
