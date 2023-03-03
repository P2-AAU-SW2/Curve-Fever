# CurveFever

# Initial setup

Jeg har installeret Express og Nodemon via NPM.

NPM laver automatisk en package-lock.json og en package.json fil, som indeholder information om programmet, og dependencies (Biblioteker som Express). node_modules indeholder selve bibliotekerne.

```
npm install express
```
Express er installeret lokalt.

## Nodemon
Nodemon bruges under udvikling, og genindlæser automatisk Node, når ændringer laves. Det gør bare alt nemere når man sidder og udvikler.

Det er installeret som en *dev* dependency, dvs. at den ikke kommer med i det endelige projekt.

```
npm install --save-dev nodemon
```

## .ENV
En .env fil bruges til "Environment variables", som er en bedre måde globalt og definere variabler på, som påvirker koden når det skal ud i brug.

Jeg har installeret en pakke via `npm install dotenv` og lavet en .env fil som indeholder PORT, som er hvad serveren lytter på.

Den kan anvendes via `process.env.PORT`

## .gitignore
En .gitignore fil, indeholder **alt** det som vi ikke ønsker, skal gemmes via GIT. Det er f.eks. vores dependencies, som vi ikke behøver at gemme. Jeg har fundet en til nodejs som indeholder det væsentlige.

## Hent programmet ned første gang.
Du skal "clone" det her repository ned på din lokale maskine, og vælge en folder som filerne skal ligge i.

I Visual Studio Code kan du bruge din command palette, til at vælge "Git clone" og vælge "Github" som kilde.

Når du er i folderen, skal du åbne en terminal og skrive `npm install`, hvilket installere vores dependencies på din egen maskine (Express og Nodemon)

## Kør programmet
Under udvikling, er der lavet et script i package.json som starter nodemon.

Skriv `npm run devStart` for at køre programmet via Nodemon.

Skriv `node server.js` for at køre programmet normalt.