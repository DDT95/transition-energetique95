# Design QA — Transition énergétique

- Source visual truth: `qa-reference-eau95.png` (rendu local du code publié de `eau95`)
- Implementation: `qa-transition.png`
- Comparison: `qa-comparison.png`
- Viewport: 1920 × 1080 CSS px, densité 1, captures normalisées dans le même onglet Chrome
- State: carte départementale initiale, première couche active

## Findings

Aucun écart P0, P1 ou P2 restant.

- Typographie : mêmes fontes Marianne, graisses, tailles, interlignages et hiérarchie que `eau95`.
- Rythme et mise en page : mêmes dimensions d’en-tête, grille 390 px / carte, marges de 16 px, cartes arrondies, ombres, panneau latéral et dialogues.
- Couleurs : mêmes tokens DDT95, bleu République, fond neutre et traitements de statut.
- Images et actifs : même logo Préfet du Val-d’Oise et mêmes fontes sources ; aucun substitut inventé.
- Contenu : les libellés sont adaptés uniquement au métier énergie, sans ajouter de navigation supérieure.
- Carte : masque extérieur au Val-d’Oise présent, 183 géométries communales visibles, cadrage départemental identique.

## Interaction checks

- Chargement de 262 914 DPE agrégés et des 183 communes : réussi.
- Recherche « Pontoise » : deux résultats territoriaux cohérents.
- Tableau de bord : ouverture réussie, six KPI et quatre graphiques.
- Sélecteur de fond, fermeture des panneaux et sources : câblés sur les composants repris de `eau95`.
- Console : aucune erreur propre à la page corrigée ; deux anciens messages d’extension provenaient de l’URL de test précédente sur le port 8765.

## Comparison history

1. Version initiale rejetée : navigation bleue supérieure inventée, absence de masque, proportions et composants différents, chargement local non vérifié.
2. Correction : remplacement de la structure et de la feuille de style par celles de `eau95`, ajout du masque départemental et adaptation exclusive des contenus et données énergie.
3. Contrôle final : comparaison côte à côte au même viewport ; aucune différence structurelle ou de charte nécessitant une correction P0/P1/P2.

## Focused regions

Le plein écran permet de lire l’en-tête, le panneau, les contrôles, la légende et le cadrage. Un contrôle DOM complémentaire a confirmé les dimensions exactes du panneau (390 px), la présence du masque et les 183 formes communales.

final result: passed
