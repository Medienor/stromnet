import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function Personvern() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Personvernerklæring</h1>
            
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Innledning</h2>
              <p>
                Din personlige integritet er viktig for oss. I denne personvernerklæringen forklarer vi hvilke personopplysninger vi samler inn, hvordan vi behandler dem, og hvilke rettigheter du har. Netsure AS ("vi"/"oss") driver denne tjenesten og er behandlingsansvarlig for dine personopplysninger. Vi følger bestemmelsene i personvernforordningen (GDPR) og annen relevant lovgivning for å sikre at opplysningene dine behandles trygt.
              </p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Opplysninger vi samler inn</h2>
              <p>
                Når du bruker tjenesten vår (for eksempel ved å fylle ut et tilbudsskjema), kan vi be om følgende personopplysninger:
              </p>
              
              <p><strong>Kontaktinformasjon:</strong> Navn, telefonnummer, e-postadresse og eventuelt postadresse. Dette er informasjon du selv oppgir i skjemaet slik at aktuelle leverandører kan nå deg med sine tilbud.</p>
              
              <p><strong>Beskrivelsesdata:</strong> Informasjon om dine behov eller preferanser som du fyller inn (f.eks. type tjeneste du ønsker, størrelse på bolig for strøm/forsikring, osv.). Selv om ikke all slik informasjon er personopplysning isolert, knyttes den til din henvendelse.</p>
              
              <p><strong>Bruksdata (cookies):</strong> Ved å bruke nettsiden samler vi også inn visse opplysninger automatisk via informasjonskapsler dersom du samtykker til det – se punkt 6 om cookies nedenfor. Dette kan inkludere IP-adresse, nettlesertype, og hvilke sider hos oss du besøker. Slik data brukes hovedsakelig til å forbedre tjenesten og brukervennligheten.</p>
              
              <p>Vi samler ikke inn sensitive personopplysninger om deg (slik som helseopplysninger, politisk tilhørighet, osv.) gjennom tilbudsfunksjonen, og ber om at du heller ikke gir oss slike opplysninger.</p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Formål med behandlingen</h2>
              <p>Vi behandler dine personopplysninger utelukkende for formål knyttet til å levere tjenesten vår til deg på en god måte:</p>
              
              <p><strong>Formidle tilbud:</strong> Hovedformålet er å kunne formidle din forespørsel videre til passende leverandører og sørge for at du mottar tilbudene du har bedt om. Kontaktinformasjonen din brukes slik at leverandørene kan ta direkte kontakt med deg og gi sine tilbud eller avtale befaring/konsultasjon dersom relevant. Ved å bruke denne tjenesten, godkjenner du at aktuelle leverandører kan kontakte deg direkte via telefon, epost og sms, også i de tilfeller hvor du er oppført i reservasjonsregistrert, ettersom samtykket ditt overstyrer reservasjonen for disse spesifikke henvendelsene.</p>
              
              <p><strong>Bekreftelse og oppfølging:</strong> Du kan motta én bekreftelses-epost når forespørselen er sendt, med informasjon vedrørende tjenesten. I noen tilfeller kan vi også gi deg mulighet til å motta tilbud på nærliggende produkter eller tjenester (for eksempel strøm, mobilabonnement eller forsikring), i denne bekreftelsesmailen.</p>
              
              <p><strong>Dokumentasjon av samtykke:</strong> Vi oppbevarer personopplysninger i opptil 12 måneder for å dokumentere at du har samtykket til å bli kontaktet. Etter denne perioden anonymiseres opplysningene.</p>
              
              <p><strong>Forebygging av misbruk:</strong> Vi forbeholder oss retten til å lagre og benytte enkelte data for å kunne avdekke og håndtere forsøk på identitetsmisbruk eller annen urettmessig bruk av tjenesten, jf. GDPR art. 6(1)(f).</p>
              
              <p><strong>Statistiske formål:</strong> Etter anonymisering kan vi benytte ikke-identifiserbare data for analyse og forbedring av tjenesten.</p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Behandlingsgrunnlag</h2>
              <p>For å behandle dine personopplysninger lovlig må vi ha et gyldig grunnlag i henhold til GDPR. I vår tjeneste baserer vi oss på følgende:</p>
              
              <p><strong>Samtykke:</strong> Det at du frivillig fyller inn og sender inn dine opplysninger via skjemaet anses som et samtykke til at vi kan behandle disse opplysningene for å oppfylle formålet (jf. GDPR art. 6(1)(a)). I praksis innebærer dette også at du samtykker til at vi sender kontaktinformasjonen din videre til utvalgte leverandører, og at disse leverandørene kan ta kontakt med deg via de kanalene du har oppgitt (telefon, e-post, SMS) for å gi sine tilbud. Du kan når som helst trekke ditt samtykke (se punkt 5 og 8 om hvordan).</p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Utlevering av opplysninger – hvem mottar dine data</h2>
              <p>For å oppfylle formålet med tjenesten videreformidler vi noen av dine personopplysninger til tredjeparter: nemlig til de leverandørene som skal utarbeide tilbud til deg.</p>
              
              <p>Når du sender inn et skjema, vil Netsure AS gjøre et utvalg av leverandører som passer din forespørsel (typisk basert på geografi, tjenestetype og kapasitet). De nødvendige opplysningene – normalt ditt navn, kontaktinformasjon og en kort beskrivelse av hva du ønsker tilbud på – deles med disse selskapene.</p>
              
              <p>Leverandørene forplikter seg overfor oss til å bruke dine data kun til formålet å utarbeide og formidle et tilbud til deg. De skal ikke bruke opplysningene dine til annen markedsføring eller dele dem videre, med mindre du selv inngår en avtale med dem og gir samtykke til ytterligere bruk.</p>
              
              <p>Du vil få vite hvilke leverandører som mottar opplysningene dine. Dette opplyses av leverandøren(e) når de kontakter deg første gang (ofte vil de presentere seg med firmanavn med en gang).</p>
              
              <p><strong>Andre tredjeparter:</strong> Vi selger ikke personopplysningene dine videre til databaser eller lignende. Den eneste gangen dine data utleveres utover leverandørene du ber om, er hvis vi er lovpålagt å utlevere noe (f.eks. ved et pålegg fra offentlige myndigheter), eller hvis vi bruker underleverandører som ledd i drift av våre systemer (for eksempel et IT-driftsselskap eller skytjeneste). I sistnevnte tilfelle vil underleverandøren behandle data kun på våre vegne og etter våre instruksjoner (databehandler), og ikke for egne formål.</p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Lagringstid – hvor lenge vi oppbevarer data</h2>
              <p>Vi oppbevarer ikke personopplysningene dine lenger enn nødvendig. Hvor lenge det er nødvendig kan variere med formål og lovkrav:</p>
              
              <p>Informasjon du sender inn via tjenesten lagres i utgangspunktet så lenge det er aktuelt å følge opp din forespørsel. Normalt betyr dette at vi beholder dine kontaktopplysninger i noen måneder etter at du har sendt inn skjemaet, i tilfelle det skulle oppstå spørsmål, eller dersom du ombestemmer deg og ønsker å kontakte flere leverandører.</p>
              
              <p>Vi har som praksis å slette eller anonymisere personopplysninger innen 6 - 12 måneder etter innsamling, med mindre det foreligger en god grunn til å beholde dem lenger. En slik grunn kan være at du inngår avtale med en leverandør via oss og det trengs dokumentasjon (f.eks. i form av et lead-bevis) i en periode, eller at du ber oss lagre informasjon for fremtidige oppdrag.</p>
              
              <p>Når opplysningene dine ikke lenger er relevante for formålet, eller maksimaltiden er nådd, slettes de på en sikker måte eller anonymiseres fullstendig.</p>
              
              <p>Hvis du ønsker det, kan du også be oss slette dine opplysninger tidligere (se dine rettigheter under). Vi vil da gjøre dette så fremt vi ikke er pålagt å beholde dem av lovmessige grunner.</p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Informasjonskapsler (cookies)</h2>
              <p>Vi bruker informasjonskapsler (cookies) for å gi deg en bedre og mer tilpasset brukeropplevelse. Noen er nødvendige for at nettsiden og skjemaene våre skal fungere, mens andre brukes til analyse og markedsføring – men kun hvis du samtykker.</p>
              
              <p>Ved første besøk vil du få mulighet til å godta alle, eller tilpasse hvilke cookies du vil tillate. Du kan når som helst endre eller trekke tilbake ditt samtykke via "Cookie-innstillinger" nederst på siden.</p>
              
              <p>Vi bruker bl.a. tredjeparts verktøy som Google Analytics, Google Ads og Facebook Pixel. Disse kan – med ditt samtykke – samle inn informasjon om bruksmønster, slik at vi kan forbedre tjenesten og vise deg relevante annonser.</p>
              
              <p>Du kan også deaktivere eller slette cookies via nettleseren din. Mer info om dette finner du på f.eks. www.allaboutcookies.org.</p>
              
              <p>For en komplett liste over alle cookies som benyttes på dette nettstedet, se punkt 13.</p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Sikkerhet – hvordan vi beskytter opplysningene</h2>
              <p>Vi tar flere grep for å sikre at dine personopplysninger ikke kommer på avveie eller misbrukes:</p>
              
              <p><strong>Tekniske tiltak:</strong> Våre databaser og systemer er sikret med tilgangskontroller, passord og kryptering der det er mulig. For eksempel bruker vi HTTPS (kryptert forbindelse) på våre nettsider for å hindre at informasjon blir avlyttet under overføring. Opplysningene du sender inn lagres i sikre miljøer som kun autorisert personell har tilgang til.</p>
              
              <p><strong>Organisatoriske tiltak:</strong> Internt i Netsure AS er det kun ansatte som trenger å behandle dine opplysninger (f.eks. kundeservice eller systemadministratorer) som får tilgang til dem. Alle slike er underlagt konfidensitetsplikt. Vi sørger også for å slette eller anonymisere persondata som nevnt når de ikke lenger trengs.</p>
              
              <p>Til tross for våre tiltak kan ingen systemer garantere 100% sikkerhet. Likevel gjør vi vårt ytterste for å holde et høyt sikkerhetsnivå som står i forhold til risikoen.</p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Dine rettigheter</h2>
              <p>Som bruker av tjenesten og registrert i våre systemer har du flere rettigheter knyttet til personopplysningene dine. Disse rettighetene kan utøves ved å kontakte oss (se kontaktinfo i bunnen av erklæringen):</p>
              
              <p><strong>Innsyn:</strong> Du har rett til å få vite hvilke personopplysninger vi har registrert om deg, og få en kopi av disse (så langt loven ikke hindrer det).</p>
              
              <p><strong>Korrigering:</strong> Hvis du oppdager at vi har feilaktige eller ufullstendige opplysninger om deg, har du rett til å få disse rettet eller slettet.</p>
              
              <p><strong>Sletting:</strong> Også kalt "retten til å bli glemt". I gitte tilfeller kan du kreve at vi sletter personopplysninger om deg, for eksempel dersom du trekker tilbake samtykket og vi ikke har annet grunnlag for å beholde opplysningene.</p>
              
              <p>Disse rettighetene er ikke absolutte – det finnes unntak – men vi vil gjøre vårt beste for å imøtekomme deg. Du kan utøve dine rettigheter kostnadsfritt.</p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Endring eller tilbaketrekking av samtykke</h2>
              <p>Dersom vi baserer en behandling på ditt samtykke, har du rett til når som helst å trekke dette samtykket tilbake. Den enkleste måten å gjøre det på er å kontakte oss via e-post.</p>
              
              <p>Hvis du trekker tilbake et samtykke, vil vi stoppe den aktuelle behandlingen av dine data som var basert på samtykket. For eksempel, om du ikke lenger vil at vi skal dele informasjonen din med leverandører eller du ønsker å kansellere forespørselen, så gi oss beskjed – men vær da oppmerksom på at tjenesten (innhenting av tilbud) ikke kan fullføres.</p>
              
              <p>Å trekke samtykke har ingen tilbakevirkende kraft; behandling som allerede er gjort, for eksempel at leverandører allerede har mottatt din info, vil ikke kunne "ugjøres" av oss. Vi vil likevel informere de aktuelle leverandørene dersom du trekker forespørselen, slik at de vet at de ikke skal kontakte deg videre.</p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Klager og tvister</h2>
              <p>Vi håper å oppklare alle spørsmål du måtte ha om personvernet ditt på en god måte. Skulle du være misfornøyd med måten vi behandler personopplysningene dine på, vennligst ta kontakt med oss først, så vil vi forsøke å finne en løsning.</p>
              
              <p><strong>Klage til Datatilsynet:</strong> Dersom du mener at vår behandling av dine personopplysninger bryter med personvernlovgivningen, har du rett til å klage til Datatilsynet (den uavhengige tilsynsmyndigheten for personvern i Norge). Du kan lese om hvordan du går frem på Datatilsynets nettsider (www.datatilsynet.no). Vi setter pris på om du likevel tar opp saken med oss først, slik at vi får mulighet til å rette opp eventuelle misforståelser eller feil.</p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Endringer i personvernerklæringen</h2>
              <p>Vi forbeholder oss retten til å oppdatere denne erklæringen dersom våre tjenester eller behandlingsaktiviteter endres, eller dersom regelverket krever det.</p>
              
              <p>Ved vesentlige endringer – som påvirker hvordan dine personopplysninger behandles – vil vi varsle deg tydelig, enten via e-post (dersom vi har den) eller gjennom et synlig varsel på nettsiden.</p>
              
              <p>Den nyeste versjonen av personvernerklæringen er alltid tilgjengelig på denne siden, med dato for siste oppdatering nederst. Ved å bruke tjenesten etter endringer, anses du å ha akseptert den oppdaterte versjonen.</p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">12. Kontaktinformasjon</h2>
              <p>Har du spørsmål om denne erklæringen eller vår bruk av personopplysninger? Ikke nøl med å kontakte oss:</p>
              
              <p><strong>Netsure AS, org nr 834 762 102</strong><br />
              E-post: <a href="mailto:data@netsure.ai" className="text-blue-600 hover:underline">data@netsure.ai</a></p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">13. Cookie-oversikt</h2>
              <p>Under finner du en liste over cookies vi bruker på nettsiden vår:</p>
              
              <div className="cky-audit-table-element"></div>
              
              <p className="mt-8 text-sm text-gray-600">
                Sist oppdatert: 09.06.2025
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
} 
