import { mkdir, writeFile } from "node:fs/promises";

const OUT = new URL("../data/", import.meta.url);
await mkdir(OUT, { recursive: true });

async function json(url) {
  const response = await fetch(url, { headers: { "user-agent": "DDT95-atlas-transition-energetique" } });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
}

async function odsAll(base, params) {
  const rows = [];
  for (let offset = 0; ; offset += 100) {
    const url = new URL(base);
    Object.entries({ ...params, limit: "100", offset: String(offset) }).forEach(([key, value]) => url.searchParams.set(key, value));
    const page = await json(url);
    rows.push(...page.results);
    if (rows.length >= page.total_count) return rows;
  }
}

const communes = await json("https://geo.api.gouv.fr/departements/95/communes?fields=nom,code,population,centre,contour&format=geojson&geometry=contour");

const consumption = await odsAll(
  "https://opendata.agenceore.fr/api/explore/v2.1/catalog/datasets/consommation-annuelle-d-electricite-et-gaz-par-commune/records",
  {
    select: "code_commune,nom_commune,annee,filiere,code_grand_secteur,sum(conso_totale_mwh) as conso_mwh,sum(nb_sites) as sites",
    where: "code_departement=\"95\" AND annee>=2020",
    group_by: "code_commune,nom_commune,annee,filiere,code_grand_secteur",
    order_by: "annee DESC"
  }
);

const productionRaw = await odsAll(
  "https://odre.opendatasoft.com/api/explore/v2.1/catalog/datasets/registre-national-installation-production-stockage-electricite-agrege/records",
  { where: "codedepartement=\"95\" AND regime=\"En service\"" }
);
const production = productionRaw.map(({ codeinseecommune, commune, nominstallation, filiere, technologie, puismaxinstallee, nbinstallations, energieannuelleglissanteinjectee, datemiseenservice_date, gestionnaire, postesource, tensionraccordement, moderaccordement }) => ({
  code: codeinseecommune, commune, filiere, technologie, puissance_kw: puismaxinstallee || 0,
  nom: nominstallation, installations: nbinstallations || 1, injection_kwh: energieannuelleglissanteinjectee || 0,
  mise_en_service: datemiseenservice_date, gestionnaire, poste_source: postesource,
  tension: tensionraccordement, raccordement: moderaccordement
}));

const atmoBase = "https://data.atmo-france.org/geoserver/ind/ows";
const atmoDate = new Date().toISOString().slice(0,10);
const atmoUrl = new URL(atmoBase);
Object.entries({ service:"WFS", version:"2.0.0", request:"GetFeature", typeNames:"ind:ind_atmo_2021", outputFormat:"application/json", count:"250", CQL_FILTER:`code_zone LIKE '95%' AND date_ech = '${atmoDate}'` }).forEach(([k,v])=>atmoUrl.searchParams.set(k,v));
const atmoRaw = await json(atmoUrl);
const airparif = atmoRaw.features.map(({properties:p})=>({code:p.code_zone,commune:p.lib_zone,date:p.date_ech,qualificatif:p.lib_qual,couleur:p.coul_qual,indice:p.code_qual,no2:p.code_no2,pm10:p.code_pm10,pm25:p.code_pm25,o3:p.code_o3}));

const dpeByCommune = {};
let dpeCount = 0;
let dpeUrl = new URL("https://data.ademe.fr/data-fair/api/v1/datasets/dpe03existant/lines");
dpeUrl.searchParams.set("size", "10000");
dpeUrl.searchParams.set("qs", "code_departement_ban:\"95\"");
dpeUrl.searchParams.set("select", "code_insee_ban,nom_commune_ban,etiquette_dpe,etiquette_ges");
while (dpeUrl) {
  const page = await json(dpeUrl);
  dpeCount += page.results.length;
  for (const row of page.results) {
    if (!/^95\d{3}$/.test(row.code_insee_ban || "") || !/[A-G]/.test(row.etiquette_dpe || "")) continue;
    const item = dpeByCommune[row.code_insee_ban] ||= { code: row.code_insee_ban, commune: row.nom_commune_ban, total: 0, classes: { A:0,B:0,C:0,D:0,E:0,F:0,G:0 }, ges: { A:0,B:0,C:0,D:0,E:0,F:0,G:0 } };
    item.total++;
    item.classes[row.etiquette_dpe]++;
    if (/[A-G]/.test(row.etiquette_ges || "")) item.ges[row.etiquette_ges]++;
  }
  dpeUrl = page.next ? new URL(page.next) : null;
}

const meta = {
  generated: new Date().toISOString(),
  consumptionRows: consumption.length,
  productionRows: production.length,
  airparifRows: airparif.length,
  airparifDate: atmoDate,
  dpeRows: dpeCount,
  communeCount: communes.features.length,
  sources: ["API Découpage administratif", "Agence ORE", "ODRÉ / RTE", "ADEME DPE", "Airparif"]
};

await Promise.all([
  writeFile(new URL("communes.geojson", OUT), JSON.stringify(communes)),
  writeFile(new URL("consommation.json", OUT), JSON.stringify(consumption)),
  writeFile(new URL("production.json", OUT), JSON.stringify(production)),
  writeFile(new URL("airparif.json", OUT), JSON.stringify(airparif)),
  writeFile(new URL("dpe.json", OUT), JSON.stringify(Object.values(dpeByCommune))),
  writeFile(new URL("meta.json", OUT), JSON.stringify(meta, null, 2))
]);
console.log(meta);
