-- Criar tabela de solicitações
CREATE TABLE IF NOT EXISTS `solicitacoes` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `tipo_solicitacao` VARCHAR(100) NOT NULL,
  `nome_solicitacao` VARCHAR(255) NOT NULL,
  `dados_formulario` TEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `solicitacoes_id` PRIMARY KEY(`id`)
);
