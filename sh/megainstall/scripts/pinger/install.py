def main():
	a = str(__file__).split('/');
	a.pop();
	s = ('/').join(a);
	
	f = open(s + '/LPinger.tpl.desktop', 'r');
	c = str(f.read());
	c = c.replace('{LPINGERPATH}', s);
	f.close();
	
	f = open(s + '/LPinger.desktop', 'w');
	f.write(c);
	f.close();
	
	f = open(s + '/run.tpl.sh', 'r');
	c = f.read();
	c = c.replace('{LPINGERPATH}', s);
	f.close();
	
	f = open(s + '/run.sh', 'w');
	f.write(c);
	f.close();
	
	f = open(s + '/cron.tpl.txt', 'r');
	c = f.read();
	c = c + '\n' + f"0 * * * * php {s}/lpinger.php"
	f.close();
	
	f = open(s + '/cron.txt', 'w');
	f.write(c);
	f.close();
	
	
	
main();
