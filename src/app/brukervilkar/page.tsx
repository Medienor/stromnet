import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function Brukervilkar() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Brukervilkår</h1>
            
            <div className="prose prose-lg max-w-none">
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Innledning og aksept av vilkår</h2>
              <p>
                Velkommen til vår anbudstjeneste ("tjenesten"). Disse brukervilkårene ("vilkårene") gjelder for all bruk av tjenesten. 
                Ved å bruke nettstedet vårt aksepterer du disse vilkårene. Hvis du ikke godtar vilkårene, må du avstå fra å bruke tjenesten. 
                Tjenesten drives av Netsure AS, org nr 834 762 102, som eier nettstedet.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Om tjenesten – hvordan den fungerer</h2>
              <p>
                Tjenesten gir deg mulighet til å etterspørre tjenester fra tredjeparter, som f.eks å innhente tilbud fra flere leverandører 
                innenfor den relevante tjenesten.
              </p>
              
              <p className="font-semibold mt-4">Slik fungerer det i praksis:</p>
              
              <p className="font-semibold mt-4">Uforpliktende forespørsel:</p>
              <p>
                Du fyller ut et skjema med relevant informasjon om dine behov. Det er gratis å sende inn en forespørsel, og du forplikter deg ikke til noe kjøp.
              </p>
              
              <p className="font-semibold mt-4">Formidling til leverandører:</p>
              <p>
                Vi videresender forespørselen din til utvalgte leverandører som tilbyr tjenester/produkter i den kategorien du har etterspurt.
              </p>
              
              <p className="font-semibold mt-4">Tilbud fra leverandører:</p>
              <p>
                Leverandører som mottar forespørselen kan ta kontakt med deg direkte, vanligvis via telefon, e-post eller SMS. 
                Normalt vil du kunne få tilbud fra flere aktører, slik at du kan sammenligne og vurdere hvem som passer best for dine behov.
              </p>
              
              <p className="mt-4">
                Vi kan ikke garantere at noen leverandør faktisk vil ta kontakt, eller at det til enhver tid finnes leverandører som har avtale med oss 
                innenfor det aktuelle området eller tjenestekategorien. Tilbud er avhengig av markedsforhold, tilgjengelige leverandører og hvor du befinner deg geografisk.
              </p>
              
              <p className="font-semibold mt-4">Kun formidling:</p>
              <p>
                Tjenesten vår gjelder kun formidling, og vi er ikke part av eventuelle avtaler som inngås mellom deg og tredjeparter som følge av at dere har kommet i kontakt gjennom bruk av denne tjenesten.
              </p>
              
              <p className="font-semibold mt-4">Du velger fritt:</p>
              <p>
                Etter å ha mottatt tilbud, står du fritt til å takke ja eller nei til disse. Tjenesten i seg selv inngår ingen avtaler på dine vegne – 
                det er opp til deg om du vil gå videre med et tilbud fra en leverandør.
              </p>
              
              <p className="mt-4">
                Etter at du har sendt inn skjemaet, vil du motta en bekreftelse fra oss (f.eks. via e-post) om at din forespørsel er registrert. 
                I denne bekreftelsen kan det fremgå hvilke leverandører som kommer til å ta kontakt, samt annen relevant informasjon i forbindelse med tjenesten. 
                Om du skulle ombestemme deg, se punkt 4 nedenfor.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Bruk av tjenesten – regler og forventninger</h2>
              <p>
                Vi ønsker at tjenesten skal være trygg og nyttig for alle parter. Derfor ber vi deg overholde følgende retningslinjer når du bruker nettstedet:
              </p>
              
              <p className="font-semibold mt-4">Riktig informasjon:</p>
              <p>
                Oppgi korrekte og fullstendige opplysninger om deg selv og dine behov. Ikke send inn falske forespørsler eller informasjon du vet er uriktig eller misvisende.
              </p>
              
              <p className="font-semibold mt-4">Ingen uautorisert tilgang:</p>
              <p>
                Du må ikke forsøke å skaffe uautorisert tilgang til deler av nettstedet som ikke er åpne for deg (for eksempel ved hacking, omgåelse av sikkerhetstiltak o.l.).
              </p>
              
              <p className="font-semibold mt-4">Ingen forstyrrelser:</p>
              <p>
                Unngå handlinger som kan hindre eller forstyrre andre brukere i å benytte tjenesten. Dette inkluderer å la være å introdusere virus, 
                skadelig programvare, eller gjøre noe som påvirker stabiliteten og sikkerheten til nettstedet.
              </p>
              
              <p className="font-semibold mt-4">Respekt for identitet:</p>
              <p>
                Du må opptre som deg selv. Ikke utgi deg for å være en annen person eller påstå at du representerer et selskap/annen part uten tillatelse.
              </p>
              
              <p className="font-semibold mt-4">Ingen uberettiget tilknytning:</p>
              <p>
                Ikke hevder noen form for tilknytning til oss eller våre samarbeidspartnere hvis du ikke har dekning for det. 
                (Alle leverandører vi samarbeider med har formelle avtaler med oss; du kan ikke selv gi inntrykk av å være vår partner uten avtale.)
              </p>
              
              <p className="mt-4">
                Brudd på disse reglene kan føre til at vi sperrer deg ute fra tjenesten. Ved mistanke om misbruk forbeholder vi oss retten til å iverksette 
                nødvendige tiltak, inkludert å nekte tilgang, for å beskytte tjenesten og andre brukere.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Ingen binding for brukeren – rett til å ombestemme seg</h2>
              <p>
                Å benytte vår tjeneste er ikke bindende. Du kan når som helst trekke tilbake forespørselen din dersom du ikke lenger ønsker oppfølging fra leverandører. 
                Hvis du ønsker å kansellere en innsendt henvendelse, kontakt oss på <a href="mailto:data@netsure.ai" className="text-blue-600 hover:underline">data@netsure.ai</a>, 
                så fjerner vi opplysningene dine fra videre formidling.
              </p>
              
              <p className="mt-4">
                Merk at det å hente inn tilbud gjennom oss ikke er et kjøp – det er først hvis du aktivt aksepterer et tilbud og inngår avtale med en leverandør at det oppstår en kontrakt. 
                En slik avtale vil være mellom deg og den aktuelle leverandøren. Du har da typisk rett til å angre kjøpet i henhold til angrerettloven 
                (for eksempel 14 dagers angrerett for forbrukertjenester inngått ved fjernsalg, der det er relevant). Eventuell bruk av angreretten må skje overfor leverandøren du inngikk avtale med. 
                Vi oppfordrer deg uansett til å lese vilkårene leverandøren oppgir nøye før du aksepterer et tilbud.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Forholdet mellom oss og leverandørene</h2>
              <p>
                Tjenesten fungerer som en mellommann mellom deg som bruker og eksterne leverandører. Det er viktig å forstå følgende om vårt rolle:
              </p>
              
              <p className="font-semibold mt-4">Ingen garanti for tilbud:</p>
              <p>
                Vi formidler din forespørsel til leverandører, men vi kan ikke garantere at alle eller noen vil svare med tilbud. 
                Antall og kvalitet på tilbud kan variere avhengig av markedet og dine oppgitte behov.
              </p>
              
              <p className="font-semibold mt-4">Uavhengige parter:</p>
              <p>
                Leverandørene vi setter deg i kontakt med er uavhengige tredjeparter. Vi er ikke eid av dem og de er ikke eid av oss, 
                og vi har ingen kontroll over deres priser, tilbud eller beslutninger.
              </p>
              
              <p className="font-semibold mt-4">Ingen ansvar for avtaler:</p>
              <p>
                Eventuelle avtaler du inngår med en leverandør som følge av et tilbud via tjenesten, er utelukkende mellom deg og den leverandøren. 
                Vi er ikke part i avtalen. Det betyr at vi ikke kan holdes ansvarlig for leveransen av produktet/tjenesten du bestiller, utførelsen, 
                kvaliteten, prisjusteringer eller andre forhold ved avtalen. Alle spørsmål eller problemer knyttet til selve leveransen må tas opp med leverandøren.
              </p>
              
              <p className="font-semibold mt-4">Ingen anbefaling eller garanti:</p>
              <p>
                Vi forsøker å samarbeide med seriøse og pålitelige aktører, men vi kan ikke garantere at tilbudene du mottar via oss er de beste eller rimeligste på markedet. 
                Tjenesten gir deg et utvalg, men du må selv vurdere hvert tilbud kritisk. Vi påtar oss heller ikke ansvar for om en leverandør faktisk kontakter deg eller ikke – 
                det er opp til leverandørene å følge opp henvendelser.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Ansvarsbegrensning og skadeløsholdelse</h2>
              <p>
                Vi gjør vårt beste for at informasjonen på nettstedet er korrekt og at tjenesten fungerer som den skal, men vi må ta visse forbehold:
              </p>
              
              <p className="font-semibold mt-4">Bruk på eget ansvar:</p>
              <p>
                Din bruk av tjenesten skjer i all hovedsak på eget ansvar. Vi kan ikke garantere at tjenesten til enhver tid er fri for feil, 
                avbrudd eller at den oppfyller dine forventninger.
              </p>
              
              <p className="font-semibold mt-4">Ingen indirekte ansvar:</p>
              <p>
                Vi er ikke ansvarlige for eventuelle tap du eventuelt måtte lide som følge av å bruke tjenesten eller basere deg på tilbud mottatt gjennom tjenesten. 
                Dette inkluderer (så langt gjeldende lov tillater) tap av fortjeneste, data, goodwill eller andre økonomiske konsekvenser.
              </p>
              
              <p className="font-semibold mt-4">Skade på utstyr:</p>
              <p>
                Vi tar ikke ansvar for skader eller virus som måtte infisere ditt datautstyr eller andre eiendeler på grunn av din tilgang til eller bruk av tjenesten. 
                (Husk å ha oppdatert sikkerhetsprogramvare.)
              </p>
              
              <p className="font-semibold mt-4">Skadeløsholdelse:</p>
              <p>
                Ved å bruke denne tjenesten, godkjenner du at Netsure AS skal holdes skadeløs for ethvert krav, og alle tvister som eventuelt oppstår mellom deg og tredjeparter 
                herunder, men ikke begrenest til, nærindsdrivende, andre brukere og offentlige myndigheter, mot oss som følge av bruk av tjenesten.
              </p>
              
              <p className="font-semibold mt-4">Forbehold om informasjon:</p>
              <p>
                Alt innhold på nettsiden gis "som det er". Vi garanterer ikke at informasjon (f.eks. prisguider, tekster, anbefalinger) er fullstendig oppdatert til enhver tid, 
                selv om vi forsøker å holde den korrekt.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Immaterielle rettigheter</h2>
              <p>
                Innholdet og utformingen av tjenesten er beskyttet av opphavsrett og andre immaterielle rettigheter:
              </p>
              
              <p className="font-semibold mt-4">Eierskap:</p>
              <p>
                Netsure AS (og evt. våre lisensgivere) eier alle rettigheter til nettstedets innhold, kildekode, design, varemerker, firmanavn og logoer. 
                Alle slike rettigheter forblir vårt eierskap i det fulle omfang loven gir.
              </p>
              
              <p className="font-semibold mt-4">Begrenset bruk:</p>
              <p>
                Som bruker får du kun en begrenset, ikke-eksklusiv rett til å bruke tjenesten til sitt formål (innhente informasjon/tilbud). 
                Du får ingen rett til å kopiere, distribuere, endre eller gjenbruke deler av nettstedet vårt til kommersielle formål uten skriftlig tillatelse fra oss.
              </p>
              
              <p className="font-semibold mt-4">Tredjepartsinnhold:</p>
              <p>
                Dersom tjenesten viser innhold (for eksempel bilder, logoer, varemerker eller tekster) som tilhører en leverandør eller annen tredjepart, 
                tilhører rettighetene fortsatt den respektive eieren. Din bruk av tjenesten gir deg ingen lisens til å utnytte slikt tredjepartsinnhold utover det som er nødvendig for tjenestens normale bruk.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Personvern og databehandling</h2>
              <p>
                Din personlige informasjon behandles i tråd med gjeldende personvernlovgivning. Vi tar personvern på alvor. 
                Opplysninger du sender inn via tjenesten brukes kun til å koble deg med relevante leverandører og for at de skal kunne kontakte deg med tilbud. 
                Vi hverken selger eller bruker personopplysningene dine til andre formål uten ditt samtykke. 
                For detaljer om hvordan vi behandler persondata, se vår <a href="/personvern" className="text-blue-600 hover:underline">personvernerklæring</a>.
              </p>
              
              <p className="mt-4">
                Kort fortalt: Ved å fylle ut og sende inn skjemaet samtykker du til at vi deler kontaktinformasjonen din med de aktuelle leverandørene, 
                slik at de kan følge opp din forespørsel. Du kan når som helst be om innsyn i eller sletting av dine data (jf. personvernerklæringen).
              </p>
              
              <p className="mt-4">
                Tjenesten benytter også informasjonskapsler (cookies) for å forbedre brukeropplevelsen. Du får valget om hvilke typer cookies du vil godta. 
                Mer info finnes i personvernerklæringen og vår cookie-oversikt.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Markedsføring og kommunikasjon</h2>
              <p>
                Ved å bruke tjenesten og samtykke der det etterspørres, godtar du at vi (eller våre partnere) kan kontakte deg i forbindelse med tjenesten. Dette inkluderer:
              </p>
              
              <p className="font-semibold mt-4">Tilbud fra leverandører:</p>
              <p>
                Som nevnt vil leverandører kontakte deg direkte med tilbud dersom du ber om det via skjemaet. 
                Dette er en naturlig del av tjenesten og ikke uønsket reklame.
              </p>
              
              <p className="font-semibold mt-4">Oppfølging:</p>
              <p>
                Vi kan sende deg en oppfølgingsmelding for å forsikre oss om at du fikk den hjelpen du trengte, 
                eller be om tilbakemelding på hvordan du opplevde tjenesten.
              </p>
              
              <p className="font-semibold mt-4">Nyhetsbrev/markedsføring:</p>
              <p>
                Vi sender kun nyhetsbrev eller generelle markedsføringshenvendelser dersom du aktivt har gitt oss et separat samtykke til det. 
                Du kan når som helst melde deg av slike utsendelser.
              </p>
              
              <p className="mt-4">
                All kommunikasjon fra oss skjer normalt elektronisk, enten via e-post eller andre digitale kanaler du har oppgitt. 
                Om du oppdager at kontaktinformasjonen du ga oss er feil, ber vi deg gi beskjed slik at vi kan rette opp dette og sikre at du får relevant informasjon.
              </p>
              
              <p className="mt-4">
                Vi forbeholder oss også retten til å korrigere åpenbare feil i kontaktopplysninger ved bruk av offentlige registre 
                (f.eks. oppdatere et mobilnummer hvis det tydelig mangler et siffer), men kun for å sikre levering av tjenesten du har bedt om.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Endringer i vilkårene</h2>
              <p>
                Vi forbeholder oss retten til å endre disse brukervilkårene ved behov. Ved vesentlige endringer vil vi forsøke å informere brukerne gjennom nettsiden 
                (og eventuelt e-post, dersom det er passende). Den til enhver tid gjeldende versjonen av vilkårene vil være publisert på nettstedet med oppgitt dato for siste oppdatering.
              </p>
              
              <p className="mt-4">
                Dersom du fortsetter å bruke tjenesten etter at oppdaterte vilkår er publisert, anses du for å ha akseptert de nye vilkårene. 
                Hvis du ikke er enig i endringer som blir gjort, ber vi deg slutte å bruke tjenesten.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Force majeure</h2>
              <p>
                Vi er ikke ansvarlige for manglende oppfyllelse av våre forpliktelser i tilfeller av force majeure – det vil si hendelser utenfor vår kontroll og som vi ikke med rimelighet kunne forutse eller unngå. 
                Dette kan inkludere naturkatastrofer, krig, terrorhandlinger, pandemier, omfattende strømbrudd, streik/lockout, eller systemsvikt hos underleverandører. 
                I slike situasjoner suspenderes våre forpliktelser i den perioden force majeure-situasjonen pågår. 
                Vi vil naturligvis gjøre vårt beste for å gjenoppta normal drift så snart situasjonen tillater det.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">12. Lovvalg og tvisteløsning</h2>
              <p>
                Disse vilkårene er underlagt og skal tolkes i samsvar med norsk lov. Partene (du som bruker og vi som selskap) skal forsøke å løse eventuelle uenigheter i minnelighet gjennom dialog.
              </p>
              
              <p className="mt-4">
                Hvis du ønsker å klage på tjenesten, må dette gjøres innen rimelig tid. Klagen bør fremsettes skriftlig.
              </p>
              
              <p className="mt-4">
                Finner vi ikke en minnelig løsning, kan hver av partene bringe saken inn for de ordinære domstoler. 
                Avtalte verneting (juridisk sted) er Gjøvik Tingrett i første instans, med mindre annet følger av preseptorisk lovgivning.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">13. Kontaktinformasjon</h2>
              <p>
                Har du spørsmål om brukervilkårene, eller vår bruk av personopplysninger? Ikke nøl med å kontakte oss:
              </p>
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold">Netsure AS, org nr 834 762 102</p>
                <p>E-post: <a href="mailto:data@netsure.ai" className="text-blue-600 hover:underline">data@netsure.ai</a></p>
              </div>
              
              <p className="mt-8 text-sm text-gray-600">
                Siste oppdatert: 09.06.2025
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
