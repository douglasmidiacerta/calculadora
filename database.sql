-- =============================================================
-- BANCO DE DADOS - CALCULADORA / SIMULADOR DE VENDAS
-- Importe este arquivo no phpMyAdmin
-- =============================================================

SET NAMES utf8mb4;
SET time_zone = '-03:00';

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id`            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `username`      VARCHAR(60)     NOT NULL,
  `password_hash` VARCHAR(255)    NOT NULL,
  `nome`          VARCHAR(120)    NOT NULL DEFAULT '',
  `ativo`         TINYINT(1)      NOT NULL DEFAULT 1,
  `criado_em`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ultimo_acesso` DATETIME            NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Usuário padrão: admin / 123456
-- (A senha é gerada com password_hash do PHP - bcrypt)
INSERT INTO `usuarios` (`username`, `password_hash`, `nome`, `ativo`) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador', 1);

-- =============================================================
-- PARA CRIAR NOVOS USUÁRIOS, use o script abaixo no terminal PHP:
--
-- echo password_hash('sua_nova_senha', PASSWORD_DEFAULT);
--
-- Ou acesse: /api/gerar_hash.php?senha=SUA_SENHA (remova após usar!)
-- =============================================================
