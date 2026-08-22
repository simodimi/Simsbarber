// Compare plusieurs modèles Ollama sur le MÊME prompt, pour choisir celui
// qui offre le meilleur compromis vitesse/qualité sur votre machine.
//
// Utilisation : node scripts/benchmarkOllama.js
//
// Avant de lancer, téléchargez les modèles que vous voulez comparer :
//   ollama pull llama3.2:1b
//   ollama pull llama3.2:3b
//   ollama pull qwen2.5:3b
//   ollama pull phi3.5:3.8b
// (vous pouvez commenter ceux que vous ne voulez pas tester dans MODELES ci-dessous)

require("dotenv").config();
const { Ollama } = require("ollama");

const ollama = new Ollama({
  host: process.env.OLLAMA_URL || "http://localhost:11434",
});

const MODELES = ["llama3.2:1b", "llama3.2:3b", "qwen2.5:3b", "phi3.5:3.8b"];

// Un prompt représentatif de ce que le chatbot devra vraiment faire :
// répondre à partir d'un contexte fourni (comme dans le RAG), pas juste
// "discuter" dans le vide.
const PROMPT = `Tu es l'assistant virtuel du salon de coiffure Sim'sBarber.
Réponds à la question du client UNIQUEMENT à partir des informations ci-dessous.
Reste bref (2-3 phrases maximum), poli et professionnel.

Informations disponibles :
1. Prestation : Coupe Classique. Catégorie : Coupe. Coupe soignée aux ciseaux et à la tondeuse. Prix : 25 euros. Durée : 30 minutes.
2. Prestation : Taille de barbe. Catégorie : Barbe. Taille et dessin de barbe au rasoir. Prix : 15 euros. Durée : 20 minutes.
3. Le salon est ouvert du lundi au samedi de 9h à 19h, fermé le dimanche.

Question du client : Bonjour, combien coûte une coupe et une taille de barbe ensemble, et êtes-vous ouverts le dimanche ?

Réponse :`;

async function testerModele(nomModele) {
  const debut = Date.now();
  try {
    const reponse = await ollama.generate({
      model: nomModele,
      prompt: PROMPT,
      stream: false,
    });
    const dureeMs = Date.now() - debut;

    // eval_count = nombre de tokens générés, eval_duration = temps en nanosecondes
    // passé uniquement à générer (hors chargement du modèle en mémoire).
    const tokensParSeconde =
      reponse.eval_count && reponse.eval_duration
        ? (reponse.eval_count / (reponse.eval_duration / 1e9)).toFixed(1)
        : "N/A";

    return {
      modele: nomModele,
      dureeTotale: `${(dureeMs / 1000).toFixed(1)}s`,
      tokensParSeconde,
      reponse: reponse.response.trim(),
      erreur: null,
    };
  } catch (err) {
    return { modele: nomModele, erreur: err.message };
  }
}

async function main() {
  console.log(
    `Benchmark sur ${MODELES.length} modèle(s), même prompt à chaque fois...\n`,
  );

  for (const modele of MODELES) {
    console.log(`── ${modele} ──`);
    const resultat = await testerModele(modele);

    if (resultat.erreur) {
      console.log(
        `  ❌ Erreur : ${resultat.erreur} (modèle pas téléchargé ? "ollama pull ${modele}")\n`,
      );
      continue;
    }

    console.log(`  Temps total     : ${resultat.dureeTotale}`);
    console.log(`  Vitesse         : ${resultat.tokensParSeconde} tokens/sec`);
    console.log(`  Réponse         : ${resultat.reponse}`);
    console.log("");
  }
}

main();
