DROP TABLE IF  EXISTS `categories`;
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '����� �������.',
  `parent_id` int(11) DEFAULT '0' COMMENT '����� �������� �������',
  `section_name` varchar(1024) DEFAULT NULL COMMENT '�����������',
  `is_deleted` int(11) DEFAULT '0' COMMENT '������ ��� ���. ����� ���������� �� �������, �� ����� � cdbfrselectmodel ���� �������, ��� ������',
  `delta` int(11) DEFAULT '0' COMMENT '�������.  ����� ���������� �� �������, �� ����� � cdbfrselectmodel ���� �������, ��� ������',
  PRIMARY KEY (`id`)
  
) ENGINE=InnoDb  DEFAULT CHARSET=UTF8 ;
