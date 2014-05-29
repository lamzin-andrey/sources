--
-- Структура таблицы `users4`
--

CREATE TABLE IF NOT EXISTS `users4` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=cp1251 AUTO_INCREMENT=5 ;

--
-- Дамп данных таблицы `users4`
--

INSERT INTO `users4` (`id`, `email`) VALUES
(1, 'lamzin80@mail.ru'),
(2, 'lamzin.an@gmail.com'),
(3, 'lamzin80@mail.rus'),
(4, 'lamzin80@mail.rut');

