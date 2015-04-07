
# Paris Galaxies

Une vision pour le Grand Paris.

## Installation serveur

Dépendances requises :
* NodeJS v0.10.28
* PostgreSQL
* Postgis
* Bower
* NPM

Étapes à suivre une fois ces dépendances installées :
* Cloner le repository : ```git clone https://github.com/rbwadd/parisgalaxies.git```
* Installer les modules NodeJS requis : ```npm install```
* Importer les données dans le serveur de base de données en exécutant les deux scripts ```01.db.rebuild.sh``` et ```node ./06.db.import.js``` du répertoire ```scripts```
* Lancer le serveur web : ```npm start```


## Installation des librairies JavaScript de l'application cliente

* Lancer la commande 'bower install'
* Puis ouvrir un navigateur sur l'adresse ```http://localhost:3712/app```
