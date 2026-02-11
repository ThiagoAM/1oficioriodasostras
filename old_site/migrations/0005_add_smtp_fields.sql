ALTER TABLE `site_settings` ADD `smtp_host` varchar(255);
ALTER TABLE `site_settings` ADD `smtp_port` int;
ALTER TABLE `site_settings` ADD `smtp_user` varchar(255);
ALTER TABLE `site_settings` ADD `smtp_password` varchar(255);
ALTER TABLE `site_settings` ADD `smtp_secure` boolean DEFAULT true;
ALTER TABLE `site_settings` ADD `solicitacoes_email` varchar(255);
