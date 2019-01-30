DROP TABLE IF  EXISTS `categories`;
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Номер раздела.',
  `parent_id` int(11) DEFAULT '0' COMMENT 'Номер родителя раздела',
  `section_name` varchar(1024) DEFAULT NULL COMMENT 'Наименовние',
  `is_deleted` int(11) DEFAULT '0' COMMENT 'Удален или нет. Может называться по другому, но тогда в cdbfrselectmodel надо указать, как именно',
  `delta` int(11) DEFAULT '0' COMMENT 'Позиция.  Может называться по другому, но тогда в cdbfrselectmodel надо указать, как именно',
  PRIMARY KEY (`id`)
  
) ENGINE=InnoDb  DEFAULT CHARSET=UTF8 ;
