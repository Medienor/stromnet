import { NextResponse } from 'next/server';

// Define the provider type
interface Provider {
  name: string;
  organizationNumber: number;
  pricelistUrl: string | null;
  slug?: string; // Add optional slug property
}

// List of all providers
const providers: Provider[] = [
  {
    "name": "Å Strøm AS",
    "organizationNumber": 982974062,
    "pricelistUrl": "https://www.astrom.no/no/stromavtaler/prisliste",
    "slug": "a-strom-as"
  },
  {
    "name": "Agva Kraft",
    "organizationNumber": 914902371,
    "pricelistUrl": "https://www.agva.no/prisliste/",
    "slug": "agva-kraft"
  },
  {
    "name": "Årdal Kraftlag",
    "organizationNumber": 922694443,
    "pricelistUrl": null,
    "slug": "ardal-kraftlag"
  },
  {
    "name": "Aursjokraft AS",
    "organizationNumber": 925700398,
    "pricelistUrl": "https://aursjokraft.no/prisliste",
    "slug": "aursjokraft-as"
  },
  {
    "name": "Austevoll Kraftlag SA",
    "organizationNumber": 959254893,
    "pricelistUrl": "https://akkraft.no/Kundeservice/Prisliste/Utg%C3%A5tte-avtaler",
    "slug": "austevoll-kraftlag-sa"
  },
  {
    "name": "Bærum Energiomsetning AS",
    "organizationNumber": 917378428,
    "pricelistUrl": "https://baerumenergi.no/prisliste/",
    "slug": "baerum-energiomsetning-as"
  },
  {
    "name": "Bodø Energi Kraftsalg AS",
    "organizationNumber": 990892687,
    "pricelistUrl": "https://bodoenergi.no/ac/prislister/",
    "slug": "bodo-energi-kraftsalg-as"
  },
  {
    "name": "Cheap Energy Norge AS",
    "organizationNumber": 914779405,
    "pricelistUrl": "https://cheapenergy.no/",
    "slug": "cheap-energy-norge-as"
  },
  {
    "name": "Dalane Energisalg AS",
    "organizationNumber": 920716636,
    "pricelistUrl": "https://dalane-energi.no/prisliste/",
    "slug": "dalane-energisalg-as"
  },
  {
    "name": "Dragefossen AS",
    "organizationNumber": 911204177,
    "pricelistUrl": null,
    "slug": "dragefossen-as"
  },
  {
    "name": "Drangedal Kraft AS",
    "organizationNumber": 924862696,
    "pricelistUrl": null,
    "slug": "drangedal-kraft-as"
  },
  {
    "name": "Eidefoss Strøm AS",
    "organizationNumber": 923354247,
    "pricelistUrl": "https://www.eidefoss.no/prisliste/category1226.html",
    "slug": "eidefoss-strom-as"
  },
  {
    "name": "Eiker Strøm AS",
    "organizationNumber": 993300012,
    "pricelistUrl": "https://www.oeenergi.no/strom/stromavtaler/,https://www.oeenergi.no/strom/strompriser/historiske-stromavtaler/",
    "slug": "eiker-strom-as"
  },
  {
    "name": "Eletra Energy AS",
    "organizationNumber": 929590759,
    "pricelistUrl": "http://www.eletraenergi.no",
    "slug": "eletra-energy-as"
  },
  {
    "name": "Finnås Kraftlag AS",
    "organizationNumber": 923934170,
    "pricelistUrl": null,
    "slug": "finnas-kraftlag-as"
  },
  {
    "name": "Fitjar Kraftlag SA",
    "organizationNumber": 971028548,
    "pricelistUrl": "https://www.fitjar-kraftlag.no/kraft-privat/abonnement/spot-time-for-time",
    "slug": "fitjar-kraftlag-sa"
  },
  {
    "name": "Fjordkraft AS",
    "organizationNumber": 976944682,
    "pricelistUrl": "https://www.fjordkraft.no/strom/stromavtale/prisliste/",
    "slug": "fjordkraft-as"
  },
  {
    "name": "Folkekraft",
    "organizationNumber": 830068112,
    "pricelistUrl": "https://folkekraft.no/prisliste",
    "slug": "folkekraft"
  },
  {
    "name": "Fortum",
    "organizationNumber": 982584027,
    "pricelistUrl": "https://www.fortum.com/no/strom/stromavtale/prisliste",
    "slug": "fortum"
  },
  {
    "name": "FosenKraft Energi",
    "organizationNumber": 883152212,
    "pricelistUrl": "https://fosenenergi.no/prisoversikt/",
    "slug": "fosenkraft-energi"
  },
  {
    "name": "Gudbrandsdal Energi AS",
    "organizationNumber": 916319983,
    "pricelistUrl": "https://www.ge.no/kraftavtaler/priser-pa-aktive-kraftavtaler",
    "slug": "gudbrandsdal-energi-as"
  },
  {
    "name": "Hammerfest Energi Kraftomsetning",
    "organizationNumber": 995680939,
    "pricelistUrl": null,
    "slug": "hammerfest-energi-kraftomsetning"
  },
  {
    "name": "Hardanger Energi AS",
    "organizationNumber": 983502601,
    "pricelistUrl": null,
    "slug": "hardanger-energi-as"
  },
  {
    "name": "Haugaland Kraft Energi AS",
    "organizationNumber": 915635903,
    "pricelistUrl": "https://hkraft.no/strom/prisliste-stromavtaler/",
    "slug": "haugaland-kraft-energi-as"
  },
  {
    "name": "Heilhornkraft AS",
    "organizationNumber": 930338028,
    "pricelistUrl": "https://kraft.bindalkraftlag.no/stromprodukt/bindal/",
    "slug": "heilhornkraft-as"
  },
  {
    "name": "Helgeland Kraft Strøm AS",
    "organizationNumber": 917424748,
    "pricelistUrl": "https://www.helgelandkraft.no/strom/privat/stromavtaler/prisliste/",
    "slug": "helgeland-kraft-strom-as"
  },
  {
    "name": "Hurum Kraft AS",
    "organizationNumber": 979914733,
    "pricelistUrl": null,
    "slug": "hurum-kraft-as"
  },
  {
    "name": "Husleiestrøm AS",
    "organizationNumber": 934221095,
    "pricelistUrl": "https://www.husleiestrom.no",
    "slug": "husleiestrom-as"
  },
  {
    "name": "Ishavskraft AS",
    "organizationNumber": 979139268,
    "pricelistUrl": "https://www.ishavskraft.no/alle-avtaler",
    "slug": "ishavskraft-as"
  },
  {
    "name": "Istad Kraft AS",
    "organizationNumber": 923253920,
    "pricelistUrl": "https://www.istadkraft.no/prisliste-istad-kraft-privat",
    "slug": "istad-kraft-as"
  },
  {
    "name": "Jærkraft AS",
    "organizationNumber": 928938611,
    "pricelistUrl": "https://jaerkraft.no/prisliste/",
    "slug": "jaerkraft-as"
  },
  {
    "name": "Jotunkraft AS",
    "organizationNumber": 881475162,
    "pricelistUrl": null,
    "slug": "jotunkraft-as"
  },
  {
    "name": "Kilden Kraft AS",
    "organizationNumber": 895691232,
    "pricelistUrl": "https://kildenkraft.no/prisliste/",
    "slug": "kilden-kraft-as"
  },
  {
    "name": "Klarkraft AS",
    "organizationNumber": 913453174,
    "pricelistUrl": null,
    "slug": "klarkraft-as"
  },
  {
    "name": "Kraftriket AS",
    "organizationNumber": 975991512,
    "pricelistUrl": "https://www.kraftriket.no/privat/stromavtaler/prisliste/",
    "slug": "kraftriket-as"
  },
  {
    "name": "Kvam Kraftverk AS",
    "organizationNumber": 979599684,
    "pricelistUrl": "https://www.kvam-kraftverk.no/prisliste-aktive-avtalar",
    "slug": "kvam-kraftverk-as"
  },
  {
    "name": "Luster Energi AS",
    "organizationNumber": 924528001,
    "pricelistUrl": "https://www.lusterenergi.no/kunde",
    "slug": "luster-energi-as"
  },
  {
    "name": "Lyse Energi AS",
    "organizationNumber": 980335224,
    "pricelistUrl": "https://www.lyse.no/kundeservice/artikler/10968664267665-utg%C3%A5tte-avtaler",
    "slug": "lyse-energi-as"
  },
  {
    "name": "Midt Energi AS",
    "organizationNumber": 977205719,
    "pricelistUrl": "https://midtenergi.no/prisliste-stromavtaler/",
    "slug": "midt-energi-as"
  },
  {
    "name": "Modalen Kraftlag SA",
    "organizationNumber": 877051412,
    "pricelistUrl": "https://www.modalenkraftlag.no/",
    "slug": "modalen-kraftlag-sa"
  },
  {
    "name": "Motkraft AS",
    "organizationNumber": 927605538,
    "pricelistUrl": "https://www.motkraft.no/prisliste",
    "slug": "motkraft-as"
  },
  {
    "name": "NEAS AS",
    "organizationNumber": 960684737,
    "pricelistUrl": "https://www.neas.mr.no/stroem/historiske-priser/",
    "slug": "neas-as"
  },
  {
    "name": "Nord-Salten Kraft AS",
    "organizationNumber": 995114666,
    "pricelistUrl": "https://nordsaltenkraft.no/prisliste",
    "slug": "nord-salten-kraft-as"
  },
  {
    "name": "Notodden Energi AS",
    "organizationNumber": 999263798,
    "pricelistUrl": "https://notodden-energi.no/prisliste-stromavtaler/",
    "slug": "notodden-energi-as"
  },
  {
    "name": "NTE Marked AS",
    "organizationNumber": 991854126,
    "pricelistUrl": "https://nte.no/strom/prisliste/",
    "slug": "nte-marked-as"
  },
  {
    "name": "Polar Kraft AS",
    "organizationNumber": 980317471,
    "pricelistUrl": "https://polarkraft.no/prisliste/",
    "slug": "polar-kraft-as"
  },
  {
    "name": "Rauland Kraft AS",
    "organizationNumber": 925017515,
    "pricelistUrl": "https://rauland-kraft.no/prisliste-straumavtaler/",
    "slug": "rauland-kraft-as"
  },
  {
    "name": "Rauma Energi AS",
    "organizationNumber": 971066547,
    "pricelistUrl": "https://www.rauma-energi.no/strom-privat",
    "slug": "rauma-energi-as"
  },
  {
    "name": "REN Røros Strøm AS",
    "organizationNumber": 919884428,
    "pricelistUrl": "https://renroros.no/bestill-strom/prisliste-strom/",
    "slug": "ren-roros-strom-as"
  },
  {
    "name": "Rissa Kraftlag SA",
    "organizationNumber": 915420400,
    "pricelistUrl": "https://www.rissakraftlag.no/stromavtaler/#stromavtaler",
    "slug": "rissa-kraftlag-sa"
  },
  {
    "name": "Saga Energi AS",
    "organizationNumber": 926418351,
    "pricelistUrl": "https://sagaenergi.no/prisliste",
    "slug": "saga-energi-as"
  },
  {
    "name": "SEV AS",
    "organizationNumber": 926186787,
    "pricelistUrl": "https://www.sevas.no/prisliste",
    "slug": "sev-as"
  },
  {
    "name": "SkandiaEnergi",
    "organizationNumber": 916493800,
    "pricelistUrl": "https://skandiaenergi.no/prisoversiktalle-avtaler",
    "slug": "skandiaenergi"
  },
  {
    "name": "Smart Energi",
    "organizationNumber": 995287889,
    "pricelistUrl": "https://www.smartenergi.com/stromavtaler-prisliste/",
    "slug": "smart-energi"
  },
  {
    "name": "Sodvin AS",
    "organizationNumber": 983474594,
    "pricelistUrl": null,
    "slug": "sodvin-as"
  },
  {
    "name": "Strøyma AS",
    "organizationNumber": 923834001,
    "pricelistUrl": null,
    "slug": "stroyma-as"
  },
  {
    "name": "Sunndal Energi AS",
    "organizationNumber": 925335703,
    "pricelistUrl": "https://www.sunndalenergi.no/stroem/prisliste/",
    "slug": "sunndal-energi-as"
  },
  {
    "name": "Svorka AS",
    "organizationNumber": 984181485,
    "pricelistUrl": null,
    "slug": "svorka-as"
  },
  {
    "name": "Telemark Kraft AS",
    "organizationNumber": 925315044,
    "pricelistUrl": "https://telemarkkraft.no/prisliste/",
    "slug": "telemark-kraft-as"
  },
  {
    "name": "Tibber",
    "organizationNumber": 917245975,
    "pricelistUrl": "https://tibber.com/no/smart-stromavtale",
    "slug": "tibber"
  },
  {
    "name": "Tinfos Strøm AS",
    "organizationNumber": 932012839,
    "pricelistUrl": "https://www.tinfos.no/",
    "slug": "tinfos-strom-as"
  },
  {
    "name": "Tinn Energi og Fiber AS",
    "organizationNumber": 982173329,
    "pricelistUrl": "https://www.tinnenergifiber.no/stromavtaler/",
    "slug": "tinn-energi-og-fiber-as"
  },
  {
    "name": "TrøndelagKraft AS",
    "organizationNumber": 880396072,
    "pricelistUrl": "https://www.trondelagkraft.no/strom/stromavtaler/prisliste/",
    "slug": "trondelagkraft-as"
  },
  {
    "name": "Ustekveikja Energi AS",
    "organizationNumber": 965809090,
    "pricelistUrl": "https://ustekveikja.no/prisliste/",
    "slug": "ustekveikja-energi-as"
  },
  {
    "name": "Varanger KraftMarked AS",
    "organizationNumber": 985519366,
    "pricelistUrl": "https://www.varanger-kraftmarked.no/stromavtaler/prisliste ",
    "slug": "varanger-kraftmarked-as"
  },
  {
    "name": "Vest-Telemark Kraftlag AS",
    "organizationNumber": 955996836,
    "pricelistUrl": null,
    "slug": "vest-telemark-kraftlag-as"
  },
  {
    "name": "VEV Romerike AS",
    "organizationNumber": 987216883,
    "pricelistUrl": "https://www.vevromerike.no/s/stromavtaleprivatkunder",
    "slug": "vev-romerike-as"
  },
  {
    "name": "Vibb AS",
    "organizationNumber": 919439734,
    "pricelistUrl": "https://vibb.no/strom/",
    "slug": "vibb-as"
  },
  {
    "name": "Viddakraft AS",
    "organizationNumber": 927779455,
    "pricelistUrl": "https://www.viddakraft.no/prisliste",
    "slug": "viddakraft-as"
  },
  {
    "name": "VOKKS Kraft AS",
    "organizationNumber": 976550013,
    "pricelistUrl": null,
    "slug": "vokks-kraft-as"
  },
  {
    "name": "Voss Energi Kraft AS",
    "organizationNumber": 918784594,
    "pricelistUrl": "https://www.vossenergi.no/straumavtalar",
    "slug": "voss-energi-kraft-as"
  },
  {
    "name": "Wattn AS",
    "organizationNumber": 925638153,
    "pricelistUrl": "https://wattn.no/privat/strom/prisliste",
    "slug": "wattn-as"
  }
];

export async function GET() {
  return NextResponse.json({
    success: true,
    data: providers
  });
} 