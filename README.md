# Observatoire de la transition énergétique du Val-d’Oise

Application cartographique de la DDT du Val-d’Oise consacrée aux consommations d’énergie, à la production renouvelable et à la rénovation énergétique.

## Données

- Agence ORE : consommations annuelles d’électricité et de gaz par commune et secteur (2020–2024)
- ODRÉ / RTE : registre des installations de production d’électricité en service
- ADEME : DPE des logements existants depuis juillet 2021, agrégés par commune
- API Découpage administratif : contours, population et référentiel communal

Les données DPE sont uniquement publiées sous forme d’agrégats communaux. La base brute et les adresses ne sont pas conservées.

Les consommations d’électricité et de gaz disposent de couches séparées, en complément de la consommation totale.

## Actualisation

```bash
node scripts/sync-data.mjs
```

Servir ensuite le dossier avec un serveur HTTP local. Le site est entièrement statique et compatible avec GitHub Pages.

## Précautions

Les DPE enregistrés ne représentent pas la totalité du parc de logements. Les installations de moins de 36 kW peuvent être soumises à des règles d’agrégation ou de confidentialité. Les consommations secrétisées par les gestionnaires ne sont pas reconstituées.
