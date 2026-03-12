#ifndef CAPPDLG_H
#define CAPPDLG_H

#include <QDialog>
#include <QLineEdit>
#include <QPushButton>
#include <QHBoxLayout>
#include <QVBoxLayout>
#include <QListWidget>
#include <QComboBox>
#include <QDate>
#include <QLabel>
#include <QSpacerItem>
#include <QGroupBox>
#include "lib/utils.h"
#include "lib/inifile.h"
#include "clist.h"

class CAppDlg : public QDialog
{
Q_OBJECT
public:
    explicit CAppDlg(QWidget *parent = 0);

    bool parseError;
    int current;
    QStringList names;
    QStringList urls;
    QString path;
    QString dPath;
    QString socketfile;

signals:
    void selectStationEvent();
public slots:
private slots:
    void onAdd();
    void onFilterKeyUp(QString s);
    void onDelete(int n);
private:
    QLineEdit *iName;
    QLabel *lName;
    QLabel *lWd;
    QLineEdit *iWd;
    QLineEdit *iFilter;
    QLabel *lFilter;
    QPushButton *bAdd;
    QPushButton *bApp;
    CList *lsWidget;
    QComboBox *ddSelect;

    QGroupBox *addStatGr;

    Utils lib;
    bool currentEdit;
    QString hosts;
    QString vhosts;
    IniFile If;
    IniFile DirConfig;
    bool isDirConfigLoaded;

    void design();
    void setListen();
    void loadData();
    void save();
    void saveExItem();

    bool isNoComments(QString str, int start);
    QString extractHostName(QString str, int start);
    void add2Hosts(QStringList &hosts, QString hostName);
    void removeFromHosts(QString s);
    void createDir(QString s);
    QString t(QString s, bool rus = true);
    QString t2(QString s, bool rus = true);
};

#endif // CAPPDLG_H
