-- MySQL
DROP TABLE IF EXISTS `main`;

CREATE TABLE IF NOT EXISTS `main`
(
   id INTEGER PRIMARY KEY AUTO_INCREMENT NOT NULL COMMENT 'Первичный ключ.',
   region INTEGER COMMENT 'Номер региона',
   KEY `region` (`region`),
   city INTEGER COMMENT 'Номер города',
   KEY `city` (`city`),
   people SMALLINT COMMENT '1 - если газель пассажирская',
   KEY `people` (`people`),
   price DECIMAL(12,2) COMMENT 'Стоимость',
   box SMALLINT COMMENT '1 - если грузовая',
   KEY `box` (`box`),
   term SMALLINT COMMENT '1 - если термобудка',
   KEY `term` (`term`),
   far SMALLINT COMMENT '1 - если межгород',
   KEY `far` (`far`),
   near SMALLINT COMMENT '1 - если по городу',
   KEY `near` (`near`),
   piknik SMALLINT COMMENT '1 - если по пикник',
   KEY `piknik` (`piknik`),
   title VARCHAR(255) COMMENT 'Заголовок объявления',
   image VARCHAR(512) COMMENT 'Путь к файлу изображений от корня сервера',
   name VARCHAR(512) COMMENT 'Имя автора (название компании)',
   addtext VARCHAR(1000) COMMENT 'Текст объявления',
   phone VARCHAR(15) COMMENT 'Номер телефона',
   KEY `phone` (`phone`),
   `pinned` SMALLINT DEFAULT 0 COMMENT 'Закреплен наверху ленты',
   created TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Время публикации проекта',
   is_moderate INTEGER DEFAULT 0 COMMENT 'Промодерирован ли конкурс',
   is_hide INTEGER DEFAULT 0 COMMENT 'Скрыто ли',
   is_deleted INTEGER DEFAULT 0 COMMENT 'Удален или нет. Может называться по другому, но тогда в cdbfrselectmodel надо указать, как именно',
   delta INTEGER COMMENT 'Позиция.  Может называться по другому, но тогда в cdbfrselectmodel надо указать, как именно'
)ENGINE=InnoDB  DEFAULT CHARSET=utf8;

DROP TRIGGER IF EXISTS `bimain`;

DELIMITER //

CREATE TRIGGER  `bimain` BEFORE INSERT ON `main`
FOR EACH ROW BEGIN
 SET NEW.delta = (SELECT max(delta) FROM `main`) + 1;
 IF NEW.delta IS NULL THEN
     SET NEW.delta = 1;
 END IF;
END//

DELIMITER ;

;


-- ALTER TABLE main ADD COLUMN `pinned` SMALLINT DEFAULT 0 COMMENT 'Закреплен наверху ленты';
