# Web, PWA et projet mobile natif

## Site de test local

Avec Node.js 18+ :

```bash
npm start
# http://localhost:4173
npm test
```

`index_preview_autonome.html` est une version monofichier qui peut être ouverte sans serveur. La version modulaire `index.html` est celle à servir sur le site web ; service worker et manifest permettent une installation PWA selon navigateur et environnement HTTPS.

## Préparer Android / iOS (non compilé dans cette livraison)

```bash
python scripts/build_mobile.py
# Copier les fichiers de index.html, src, assets, sw.js, manifest dans www/
# Installer Node / Capacitor CLI dans votre environnement local
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap add android
npx cap add ios
npx cap sync
npx cap open android
npx cap open ios
```

L'étape iOS demande Xcode sur macOS et un compte développeur adapté. L'étape Android demande Android Studio. Capacitor peut nécessiter la configuration d'URL, d'IDs d'application et de permissions spécifiques suivant la plateforme et les versions. **Aucun `.apk` ou `.ipa` testé n'est inclus** ; le dossier `www` est une préparation du client.

## Backend nécessaire avant déploiement avec comptes

Le schéma `db/schema.sql` constitue seulement la cible. Un backend auth, persistance partagée, tirages signés, packs validés serveur, salons en ligne, stockage d'assets et opérations idempotentes n'est pas inclus. Le code `N` est publié dans le JavaScript et n'est donc pas secret : remplacer impérativement cette mécanique par des rôles serveur avant de donner de vrais privilèges à des utilisateurs.
