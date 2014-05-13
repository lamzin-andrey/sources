-- MySQL
DROP TABLE IF EXISTS `users`;

CREATE TABLE IF NOT EXISTS `users`
(
   id INTEGER PRIMARY KEY AUTO_INCREMENT NOT NULL COMMENT 'Первичный ключ.',
   pwd VARCHAR(32) COMMENT 'пароль',
   rawpass  VARCHAR(32) COMMENT 'пароль как он есть',
   phone VARCHAR(15) COMMENT 'Номер телефона',
   email    VARCHAR(64) COMMENT 'email',
   firster    TINYINT COMMENT 'Признак того, что я его сам добавил, предложим восстановление пароля на email',
   is_deleted INTEGER DEFAULT 0 COMMENT 'Удален или нет. Может называться по другому, но тогда в cdbfrselectmodel надо указать, как именно',
   delta INTEGER COMMENT 'Позиция.  Может называться по другому, но тогда в cdbfrselectmodel надо указать, как именно'
)ENGINE=InnoDB  DEFAULT CHARSET=utf8;

DROP TRIGGER IF EXISTS `biusers`;

DELIMITER //

CREATE TRIGGER  `biusers` BEFORE INSERT ON `users`
FOR EACH ROW BEGIN
 SET NEW.delta = (SELECT max(delta) FROM `users`) + 1;
 IF NEW.delta IS NULL THEN
     SET NEW.delta = 1;
 END IF;
END//

DELIMITER ;

;


-- ALTER TABLE users ADD COLUMN `pinned` SMALLINT DEFAULT 0 COMMENT 'Закреплен наверху ленты';
