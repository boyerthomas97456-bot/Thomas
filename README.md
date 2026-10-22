# Battle du panier

Version actuelle du jeu éducatif sur l'alimentation qualitative.

## Lancer le site

Publier le contenu du dossier `dist` sur un hébergeur statique (les modules 3D se chargent par HTTP : ouvrir `index.html` directement depuis le disque ne suffit pas).

## Fichiers principaux

- `index.html` : jeu, règles, questions, scores et progression.
- `characters.png` : illustrations des personnages (Professeur Fraise…).
- `premium.css` : habillage graphique « jeu mobile 3D cartoon » (boutons, cartes, décors, animations).
- `premium.js` : habille chaque écran (images 3D des aliments, scanner SIGA, labo du corps 3D, plateaux de l'assiette, console de la bombe…). Ne modifie aucune règle.
- `food3d.js` : bibliothèque d'aliments et pictogrammes 3D construits avec Three.js.
- `icons3d.js` : transforme ces modèles 3D en images pour les écrans.

Si un module 3D ne se charge pas, le jeu reste jouable avec son rendu simple.
