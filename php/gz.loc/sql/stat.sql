-- MySQL
DROP TABLE IF EXISTS `stat`;

CREATE TABLE IF NOT EXISTS `stat`
(
   region INTEGER COMMENT 'Номер региона',   
   city INTEGER COMMENT 'Номер города',   
   country INTEGER COMMENT 'Номер страны',
   KEY `region` (`region`), KEY `city` (`city`),
   UNIQUE KEY `location` (`region`, `country`, `city`),
    cnt INTEGER COMMENT 'Счетчик обращений к страницам, на которых пока нет объявлений'
   
)DEFAULT CHARSET=utf8;
