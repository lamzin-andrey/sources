
--
-- ��������� ������� `Product`
--

CREATE TABLE IF NOT EXISTS `Product` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) DEFAULT NULL,
  `url` varchar(64) DEFAULT NULL,
  `image` varchar(64) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=cp1251 AUTO_INCREMENT=7 ;

--
-- ���� ������ ������� `Product`
--

INSERT INTO `Product` (`id`, `name`, `url`, `image`, `price`) VALUES
(1, '������ �������', 'http://firt.product', '/images/1.png', '20.02'),
(2, '������ �������', 'http://second.product', '', '45.05'),
(3, '������ �������', 'http://third.product', '/images/1.png', '582.25'),
(4, '��������� �������', 'http://four.product', '/images/1.png', '700.25'),
(5, '����� �������', 'http://werse.ws', '', '5542.25'),
(6, '������ �������', 'http://newprod.php', '/images/1.png', '1200.00');
