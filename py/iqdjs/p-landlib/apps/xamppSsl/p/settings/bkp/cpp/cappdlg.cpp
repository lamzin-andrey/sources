#include "cappdlg.h"

CAppDlg::CAppDlg(QWidget *parent) :  QDialog(parent) {
    //this->hide();;
    If.loadFile("/usr/local/fastxampp/lang");
    design();
    setListen();
    loadData();
    char* chome = new char[255];
    chome =  getenv("HOME");
    QString home(chome);
    socketfile = home + "/.config/fastxampp/.sock";

    isDirConfigLoaded = false;
    QString dirConfigFile = home + "/.config/fastxampppersist/workdirs.ini";
    if (QFile::exists(dirConfigFile)) {
        DirConfig.loadFile(dirConfigFile);
        isDirConfigLoaded = true;
    } else {
        QDir * qd = new QDir();
        bool r = qd->mkdir(home + "/.config/fastxampppersist");
        lib.writetextfile(dirConfigFile, "localhost=www");

        DirConfig.loadFile(dirConfigFile);
        isDirConfigLoaded = true;
    }
}

//TODO clean conf?
void CAppDlg::onDelete(int n) {
    if (names.size() == 0) return;
    if (n < names.size()) {
        QString quText = t(If["confirm_delete_host"], false);
        quText = quText.replace("{HOST}", names[n]);
        QString res = lib.qMessageBox(t(If["warning"], false), quText, "question", "yes", "no");
        if (res == "yes") {
            removeFromHosts(names[n]);
            names.removeAt(n);
            save();
            loadData();
            lib.writetextfile(socketfile, "xampprestart");
        }
    }
}

void CAppDlg::removeFromHosts(QString hostName) {
    QString sHosts = lib.readtextfile(hosts, true);
    QStringList hls = sHosts.split("\n");
    for (int i = 0; i < hls.size(); i++) {
        QString s = hls[i];
        int n = s.indexOf(hostName);
        if ( n > -1 ) {
            if (s[n - 1] != '.' && s[n - 1] != '-') {
                hls[i] = "#" + hls[i];
            }
        }
    }
    QFile file2(hosts);
    if (file2.open(QFile::WriteOnly)) {
        QString cont = hls.join("\n");
        //lib.qMessageBox("", cont);
        QByteArray ba(cont.toUtf8() );
        file2.write(ba);
        file2.close();
    }
}

void CAppDlg::loadData() {
    hosts  = "/etc/hosts";
    vhosts = "/opt/lampp/etc/extra/httpd-vhosts.conf";
    parseError = false;
    current = 0;
    lib.parentMBoxWidget = this;
    QString sVhosts = lib.readtextfile(vhosts, true);
    QStringList ls = sVhosts.split("\n");
    names.clear();
    lsWidget->clear();
    for (int i = 0; i < ls.size(); i++) {
        QString str = ls[i];
        int start = str.indexOf("ServerName ");
        if (start > -1 ) {
            if (isNoComments(str, start)) {
                QString hostName = extractHostName(str, start + 11);
                names << hostName;
                lsWidget->addItem(hostName);
            }
        }
    }
}

bool CAppDlg::isNoComments(QString str, int start) {
    int inStr = 0;
    int inChr = 0;
    for (int i = start; i > -1; i--) {
        if (str[i] == '"') {
            if ( inStr == 0 ) {
                inStr = 1;
            } else {
                inStr = 0;
            }
        }
        if (str[i] == '\'') {
            if ( inChr == 0 ) {
                inChr = 1;
            } else {
                inChr = 0;
            }
        }
        if (str[i] == '#' && inStr == 0 && inChr == 0) return false;
    }
    return true;
}

QString CAppDlg::extractHostName(QString str, int start) {
    QString sym = lib.lat + ".0123456789-";
    QString res = "";
    int isStart = 0;
    for (int i = start; i < str.length(); i++) {
        QChar ch = str[i];
        if (sym.indexOf(ch) > -1) {
            isStart = 1;
            res += ch;
        } else {
            if (isStart == 1) break;
        }
    }
    return res;
}

void CAppDlg::design() {
    this->setWindowTitle(t(If["set_dlg_title"]));
    QVBoxLayout *main = new QVBoxLayout;

    //add station block
    QVBoxLayout *addInputsLayout = new QVBoxLayout;
    QHBoxLayout * stationName = new QHBoxLayout;
    lName = new QLabel( t(If["site_name"]) );
    int lblw = 120;
    lName->setMinimumWidth(lblw);
    iName = new QLineEdit();
    stationName->addWidget(lName);
    stationName->addWidget(iName);

    QHBoxLayout * workDirName = new QHBoxLayout;
    lWd = new QLabel( t(If["wd_name"]) );
    lWd->setMinimumWidth(lblw);
    iWd = new QLineEdit();
    iWd->setText("www");
    workDirName->addWidget(lWd);
    workDirName ->addWidget(iWd);

    QHBoxLayout * addBtnLay = new QHBoxLayout;
    bAdd = new QPushButton( t(If["add"]) );
    QSpacerItem* addbtnsp = new QSpacerItem(250, 10, QSizePolicy::Expanding, QSizePolicy::Expanding);
    addBtnLay->addSpacerItem(addbtnsp);
    addBtnLay->addWidget(bAdd);

    addInputsLayout->addLayout(stationName);
    addInputsLayout->addLayout(workDirName);
    addInputsLayout->addLayout(addBtnLay);

    addStatGr = new QGroupBox;
    addStatGr->setTitle( t(If["add_site"]) );
    addStatGr->setLayout(addInputsLayout);
    // --/add station block

    //list station block

    QHBoxLayout *filStatLayout = new QHBoxLayout;
    iFilter = new QLineEdit;
    lFilter = new QLabel(t(If["filter"]));
    filStatLayout->addWidget(lFilter);
    filStatLayout->addWidget(iFilter);

    QVBoxLayout *listStatLayout = new QVBoxLayout;
    lsWidget = new CList;
    listStatLayout->addLayout(filStatLayout);
    listStatLayout->addWidget(lsWidget);

    QGroupBox *lsStatGr = new QGroupBox;
    lsStatGr->setTitle( t(If["sitelist"]) );
    lsStatGr->setLayout(listStatLayout);

    // --/list station block

    main->addWidget(addStatGr);
    main->addWidget(lsStatGr);
    this->setLayout(main);
}

void CAppDlg::setListen() {
    currentEdit = -1;
    connect(bAdd, SIGNAL(clicked()), this, SLOT(onAdd()));
    connect(iFilter, SIGNAL(textChanged(QString)), this, SLOT(onFilterKeyUp(QString)));
    connect(lsWidget, SIGNAL(remAct(int)), this, SLOT(onDelete(int)));
}

void CAppDlg::saveExItem() {
    if (currentEdit == -1) {
        return;
    }
    for (int i = 0; i < urls.size(); i++) {
        if (i == currentEdit) continue;
        if (names[i] == iName->text()) {
            lib.qMessageBox(t(If["error"], false), t(If["already_exists"], false), "error");
            return;
        }
    }
    names[currentEdit] = iName->text();
    currentEdit = -1;
    save();
    loadData();
    iName->setText("");
    addStatGr->setTitle(t(If["add_site"]));
    bAdd->setText(t(If["add"]));
}

void CAppDlg::onAdd() {
    if ( iName->text().trimmed() == "" ) {
        lib.qMessageBox(t(If["error"]), t2("need_sitename"), "error");
        return;
    }
    QString s = iName->text();
    if ( s[s.length() - 1] == '.' ) {
        lib.qMessageBox(t(If["error"]), t2("need_domain"), "error");
        return;
    }
    for (int i = 0; i < names.size(); i++) {
        if (names[i] == iName->text()) {
            lib.qMessageBox(t(If["error"], false), t2("already_exists", false), "error");
            return;
        }
    }
    names << iName->text();
    createDir( iName->text() );
    QString sDir = iWd->text().trimmed();
    if (sDir != "www") {
        QString sKey = iName->text().trimmed();
        DirConfig.insert(sKey, sDir);
        DirConfig.save();
    }

    save();
    loadData();
    iName->setText("");
    lib.writetextfile(socketfile, "xampprestart");
}

void CAppDlg::createDir(QString s) {
    QString wd = "www";
    QString custom = iWd->text().trimmed();
    wd = custom.length() ? custom : wd;
    QDir dir("/opt/lampp/htdocs/" + s + "/" + wd);
    if (!dir.exists()) {
        dir.mkdir("/opt/lampp/htdocs/" + s);
        dir.mkdir("/opt/lampp/htdocs/" + s + "/" + wd);
        lib.writetextfile("/opt/lampp/htdocs/" + s + "/" + wd + "/index.php", "It's " + s + " on localhost (127.0.0.1)");
    }
}

void CAppDlg::save() {
    QString tpl = "<VirtualHost *:80>\n";
    tpl += "\tServerAdmin webmaster@{HOST}\n";
    tpl += "\tServerName {HOST}\n";
    tpl += "\tDocumentRoot \"/opt/lampp/htdocs/{HOST}/{www}\"\n";
    tpl += "\tScriptAlias /cgi/ \"/opt/lampp/htdocs/{HOST}/cgi/\n";
    tpl += "\tErrorLog /opt/lampp/htdocs/{HOST}/error.log\n";
    tpl += "\tCustomLog /opt/lampp/htdocs/{HOST}/access.log common\n";
    tpl += "</VirtualHost>\n\n";
    QString s = "NameVirtualHost *:80\n";
    QString sHosts = lib.readtextfile(hosts, true);
    QStringList hls = sHosts.split("\n");
    QString buf = "";
    for (int i = 0; i < names.size(); i++) {
        QString q = tpl;
        QString wd = "www";
        QString custom = DirConfig[names[i]];
        wd = custom.length() ? custom : wd;
        buf = q.replace("{HOST}", names[i]);
        s += buf.replace("{www}", wd);
        add2Hosts(hls, names[i]);
    }
    QFile file(vhosts);
    if (file.open(QFile::WriteOnly)) {
        QByteArray ba(s.toUtf8() );
        file.write(ba);
        file.close();
    }
    QFile file2(hosts);
    if (file2.open(QFile::WriteOnly)) {
        QByteArray ba(hls.join("\n").toUtf8() );
        file2.write(ba);
        file2.close();
    }
}

void CAppDlg::add2Hosts(QStringList &hosts, QString hostName) {
    //if str ! is #
    //  if host is 127.0.0.* break
    //    else set #; add host 127.0.0.1
    // if str is # and jost is 127.0.0.1 delete #
    int found = 0;
    for (int i = 0; i < hosts.size(); i++) {
        QString s = hosts[i];
        int n = s.indexOf(hostName);
        if ( n > -1 && found == 0) {
            //TODO analize it
            if (n > 0) {
                if (s[n - 1] == '.') {
                    continue;
                } else {
                    if (isNoComments(s, n)) {
                        if (s.indexOf("127.0.0.") == -1) s = "#" + s + "\n127.0.0.1\t" + hostName;
                    } else {
                        s = "127.0.0.1\t" + hostName;
                    }
                }
            } else {
                lib.qMessageBox("Adding...", "in null on '" + hostName + "',\ns = '" + s);
                s = "";
            }
            hosts[i] = s;
            found = 1;
        }
    }
    if (found == 0) {
        hosts << "127.0.0.1\t" + hostName;
    }
}


void CAppDlg::onFilterKeyUp(QString s) {
    if (s == "") {
        loadData();
        return;
    }
    lsWidget->clear();
    for (int i = 0; i < names.size(); i++) {
        QString q = names[i];
        if (q.indexOf(s) != -1) {
            lsWidget->addItem(q);
        }
    }
}

QString CAppDlg::t(QString s, bool rus) {
    s = s.replace("\\n", "\n");
    if (rus) {
        s = lib.rus(s);
    }
    return s;
}
QString CAppDlg::t2(QString s, bool rus) {
    s = If[s];
    s = s.replace("\\n", "\n");
    if (rus) {
        s = lib.rus(s);
    }
    return s;
}
