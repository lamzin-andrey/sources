#include <iostream>
#include <string>
#include "utilsstd.h"
#include <unistd.h>


using namespace std;

int main (int argc, char** argv) {
	UtilsStd lib;
	
	if (argc != 2) {
		cout << "error get name\n";
		return 0;
	}
	
	string name = string(argv[1]);
	string path = string("/home/") + name + string("/.config/fastxampp/.sock");
	string outfile = string("/home/") + name + string("/.config/fastxampp/.out");
	string devnull = string("/dev/null");
	
	string cmdrestart = "/opt/lampp/lampp restart";
	lib.sys(cmdrestart , outfile);
	lib.write("", path);
	lib.sys("chown " + name + ":" + name +" /home/" + name + "/.config/fastxampp/.sock" , devnull);
	
	
	int sz = lib.filesize(path);
	if (sz == 12) {
		//cout << "ok" << "\n";
		lib.sys("chmod 777 " + path, devnull);
		lib.write("outfile", outfile);
		lib.sys("chmod 777 " + outfile, devnull);
	} else {
		//cout << "fail write to " << path << "\n";
		//return 0;
	}
	//cout << path << "\n";
	
	
	int processRunned = 0;
	string currentState = "";
	int controlTime = 0;
	int controlTimeLimit = 10;// После этого currentState в любом случае сбрасывается
	
	while (true) {
		if (processRunned == 0) {
			currentState = lib.read(path);
			
			sz = lib.filesize(path);
			if (sz == 1) {
				lib.sys("unlink " + path, devnull);
				lib.write("xampprestart", path);
				lib.sys("chmod 777 " + path, devnull);
				lib.sys("chmod 777 " + outfile, devnull);
			}
			
			if (currentState == "") {
				currentState = "xampprestart";
			}
			if (currentState == "xampprestart") {
				lib.write("...", outfile);
				
				processRunned = 1;
				controlTime = 0;
				
				//cout << "run " << cmdrestart << "\n";
				lib.sys(cmdrestart , outfile);
				
				lib.sys("chmod 776 " + path, devnull);
				lib.sys("chmod 776 " + outfile, devnull);
			}
			if (currentState == "xamppstop") {
				lib.write("...", outfile);
				processRunned = 1;
				controlTime = 0;
				string cmd = "/opt/lampp/lampp stop";
				//cout << "run " << cmd << "\n";
				lib.sys(cmd , outfile);
				lib.sys("chmod 776 " + path, devnull);
				lib.sys("chmod 776 " + outfile, devnull);
			}
			
		} else { //if process runned
			if (currentState == "xampprestart") {
				string r = lib.read(outfile);
				//cout << r << "\n";
				//cout << "pos Starting Apache...ok. : " << lib.pos("XAMPP: Starting Apache...ok.", r) << "\n";
				//cout << "pos Starting MySQL...ok. : " << lib.pos("XAMPP: Starting MySQL...ok.", r) << "\n";
				//cout << "pos Starting ProFTPD...ok. : " << lib.pos("XAMPP: Starting ProFTPD...ok.", r) << "\n";
				if (
					(lib.pos("XAMPP: Starting Apache...ok.", r) != -1 
					 || lib.pos("XAMPP: Starting Apache...already running", r) != -1 )
					
					&& 
					(lib.pos("XAMPP: Starting MySQL...ok.", r) != -1
						|| lib.pos("XAMPP: Starting MySQL...already running", r) != -1 
					)
					
					// && lib.pos("XAMPP: Starting ProFTPD...ok.", r) != -1
				   ) {
					lib.write("restarted", path);
					
					sz = lib.filesize(path);
					if (sz != 9) {
						lib.sys("unlink " + path, devnull);
						lib.write("restarted", path);
						lib.sys("chmod 777 " + path, devnull);
						lib.sys("chmod 777 " + outfile, devnull);
					}
					
					processRunned = 0;
					currentState = "";
					lib.sys("chmod 776 " + path, devnull);
					lib.sys("chmod 776 " + outfile, devnull);
					//cout << "I write restarted" << "\n";
				}
			}
			if (currentState == "xamppstop") {
				string r = lib.read(outfile);
				
				//cout << r << "\n";
				//cout << "pos Stopping Apache...ok. : " << lib.pos("XAMPP: Stopping Apache...ok.", r) << "\n";
				//cout << "pos Stopping MySQL...ok. : " << lib.pos("XAMPP: Stopping MySQL...ok.", r) << "\n";
				//cout << "pos Stopping ProFTPD...ok. : " << lib.pos("XAMPP: Stopping ProFTPD...ok.", r) << "\n";
				
				//cout << "pos Stopping Apache...not running. : " << lib.pos("XAMPP: Stopping Apache...not running.", r) << "\n";
				//cout << "pos Stopping MySQL...not running. : " << lib.pos("XAMPP: Stopping MySQL...not running.", r) << "\n";
				//cout << "pos Stopping ProFTPD...not running. : " << lib.pos("XAMPP: Stopping ProFTPD...not running.", r) << "\n";
				
				
				if (
						(lib.pos("XAMPP: Stopping Apache...ok.", r) != -1
						&& lib.pos("XAMPP: Stopping MySQL...ok.", r) != -1
						&& lib.pos("XAMPP: Stopping ProFTPD...ok.", r) != -1)
						|| (lib.pos("XAMPP: Stopping Apache...not running.", r) != -1
						&& lib.pos("XAMPP: Stopping MySQL...not running.", r) != -1
						//&& lib.pos("XAMPP: Stopping ProFTPD...not running.", r) != -1
						)
				   ) {
					//cout << "will write stopped" << "\n";
					lib.write("stopped", path);
					
					sz = lib.filesize(path);
					if (sz != 7) {
						lib.sys("unlink " + path, devnull);
						lib.write("stopped", path);
						lib.sys("chmod 777 " + path, devnull);
						lib.sys("chmod 777 " + outfile, devnull);
					}
					
					lib.sys("chmod 776 " + path, devnull);
					lib.sys("chmod 776 " + outfile, devnull);
					processRunned = 0;
					currentState = "";
				}
			}
		}
		sleep(1);
		controlTime++;
		if (controlTime > controlTimeLimit) {
			currentState = "";
			processRunned = 0;
			controlTime = 0;
		}
	}
	
	
	return 0;
	
	
	string s = lib.read(path);
	cout << s << "\n";
	lib.write("test", path);
	sleep(1);
	cout << "Bye!" << "\n";
	return 0;
}
