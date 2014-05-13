-- MySQL
DROP TABLE IF EXISTS `admins`;

CREATE TABLE IF NOT EXISTS `admins`
(
   id INTEGER PRIMARY KEY AUTO_INCREMENT NOT NULL COMMENT 'Первичный ключ.',
   pwd VARCHAR(32) COMMENT 'пароль',
   login  VARCHAR(32) COMMENT 'login',
   is_deleted INTEGER DEFAULT 0 COMMENT 'Удален или нет. Может называться по другому, но тогда в cdbfrselectmodel надо указать, как именно',
   delta INTEGER COMMENT 'Позиция.  Может называться по другому, но тогда в cdbfrselectmodel надо указать, как именно'
)ENGINE=InnoDB  DEFAULT CHARSET=utf8;

DROP TRIGGER IF EXISTS `biadmins`;

DELIMITER //

CREATE TRIGGER  `biadmins` BEFORE INSERT ON `admins`
FOR EACH ROW BEGIN
 SET NEW.delta = (SELECT max(delta) FROM `admins`) + 1;
 IF NEW.delta IS NULL THEN
     SET NEW.delta = 1;
 END IF;
END//

DELIMITER ;

;


-- ALTER TABLE admins ADD COLUMN `pinned` SMALLINT DEFAULT 0 COMMENT 'Закреплен наверху ленты';
