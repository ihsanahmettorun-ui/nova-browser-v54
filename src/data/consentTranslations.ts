import { ConsentItem, MANDATORY_CONSENTS } from '../../server/consents.ts';

export interface ConsentTranslationData {
  title: string;
  subtitle: string;
  noticeTitle: string;
  noticeBody: string;
  acceptAll: string;
  submitButton: string;
  protocolText: string;
  errorMsg: string;
  disclaimerTag: string;
  originalButton: string;
  translatedBadge: string;
  translatingNotice: string;
  searchLangPlaceholder: string;
  clauses: Record<string, { title: string; text: string }>;
}

export const PRECOMPILED_CONSENT_TRANSLATIONS: Record<string, ConsentTranslationData> = {
  tr: {
    title: 'Nova Sistem Kurulumu v54',
    subtitle: 'Zorunlu Kullanıcı Doğrulama, Katı Maddeler & Güvenlik Sözleşmesi',
    noticeTitle: 'Katı Sorumluluk Reddi & Güvenlik Bildirisi:',
    noticeBody: 'Nova Browser üzerinden indirilen ve yapılan bütün olaylardan, dosyalardan, işlemlerden ve sonuçlarından yapımcı Orhan Süleyman Torun ve Nova Browser KESİNLİKLE VE HİÇBİR ŞEKİLDE SORUMLU DEĞİLDİR. İndirilen dosyaların açılması, yürütülmesi ve yapılan tüm eylemlerin sorumluluğu münhasıran kullanıcıya aittir.',
    acceptAll: 'Tüm Zorunlu Maddeleri Kabul Et',
    submitButton: 'Nova v54 Başlat & Gezinmeye Başla',
    protocolText: 'Protokol',
    errorMsg: 'Devam edebilmek ve Nova Browser altyapısını kullanabilmek için yukarıdaki tüm zorunlu maddeleri tek tek veya "Tümünü Onayla" ile kabul etmeniz gerekmektedir.',
    disclaimerTag: 'Katı Hüküm',
    originalButton: 'Orijinal Türkçe Metin',
    translatedBadge: 'Canlı Çeviri Aktif',
    translatingNotice: '145+ dil sistemiyle katı maddeler çevriliyor...',
    searchLangPlaceholder: 'Dünya dillerinde ara (145+ Dil)...',
    clauses: {
      producer_orhan_suleyman_torun_waiver: {
        title: '1. Yapımcı Orhan Süleyman Torun ve Kesin Sorumsuzluk Beyanı (Zorunlu ve Katı Onay)',
        text: 'Bu uygulamanın yapımcısı ve yazarı Orhan Süleyman Torun\'dur. Uygulamanın indirilmesi, kurulması, çalıştırılması, masaüstü veya web üzerinden kullanımı sırasında; kullanıcı tarafından indirilen HER TÜRLÜ DOSYADAN, girilen sitelerden, yapılan işlemlerden, doğabilecek veri kayıplarından, virüs/zararlı yazılım bulaşmalarından, donanımsal veya yazılımsal arızalardan ve hukuki sonuçlardan yapımcı Orhan Süleyman Torun KESİNLİKLE VE HİÇBİR KOŞULDA SORUMLU DEĞİLDİR. Bu uygulamayı indirmek, kurmak veya kullanmak isteyen her kullanıcı yapımcı Orhan Süleyman Torun\'un hiçbir sorumluluğu olmadığını ve tüm sorumluluğun tamamen kendisine ait olduğunu peşinen ve gayrikabili rücu kabul, beyan ve taahhüt eder.',
      },
      downloads_actions_liability: {
        title: '2. İndirilen Dosyalar ve Yapılan Bütün Olaylardan Sorumsuzluk Reddi (Kesin ve Katı Hüküm)',
        text: 'Nova Browser üzerinden indirilen HER TÜRLÜ DOSYADAN (yazılım, arşiv, belge, medya veya çalıştırılabilir programlar) ve kullanıcı tarafından gerçekleştirilen YAPILAN BÜTÜN OLAYLARDAN, eylemlerden ve işlemlerden yapımcı Orhan Süleyman Torun ve Nova Browser HİÇBİR ŞEKİLDE VE KESİNLİKLE SORUMLU DEĞİLDİR. İndirilen dosyaların açılması, kullanılması veya sistemde oluşturabileceği virüs, hasar, veri kaybı ve hukuki sorumluluklar münhasıran ve tamamen kullanıcıya aittir.',
      },
      liability_disclaimer: {
        title: '3. Yapımcı ve Geliştirici Genel Sorumluluk Reddi',
        text: 'Nova Browser ve NovaSearch sunucu altyapısı bağımsız bir web tarayıcısı ve arama motoru aracıdır. Kullanıcının tarayıcı ve sunucu üzerinden eriştiği, arattığı, indirdiği, paylaştığı veya görüntülediği hiçbir içerikten, web sitesinden veya işlemden uygulamanın yapımcısı/geliştiricisi Orhan Süleyman Torun sorumlu tutulamaz. Tüm hukuki, cezai ve idari sorumluluk münhasıran kullanıcıya aittir.',
      },
      age_parental_consent: {
        title: '4. Yaş Sınırı ve Ebeveyn / Veli İzni Şartı',
        text: 'Bu tarayıcıyı ve arama sunucusunu kullanabilmek için reşit olmanız veya 18 yaşın altındaysanız yasal ebeveyninizin/velinizin açık izni ve gözetimi altında olmanız zorunludur. Ebeveynler, çocuklarının ziyaret ettiği sitelerin denetiminden doğrudan sorumludur.',
      },
      virus_malware_security: {
        title: '5. Virüs, Kötü Amaçlı Yazılım ve Siber Güvenlik Koruması',
        text: 'Tarayıcı, zararlı URL filtreleme ve sandbox koruması sağlamakla birlikte, internet üzerindeki üçüncü taraf sitelerden indirilen dosyalardan, scriptlerden veya harici kaynaklardan kaynaklanabilecek virüs, truva atı, fidye yazılımı ve siber tehditlere karşı kullanıcının kendi cihaz güvenlik önlemlerini (antivirüs, güncel işletim sistemi) alması zorunludur. Dış kaynaklı dosya çalıştırmalarından doğacak risk kullanıcıya aittir.',
      },
      privacy_local_only: {
        title: '6. Kişisel Veriler ve Sıfır-Günlük (Local-Only Zero-Knowledge)',
        text: 'Nova Browser ve NovaSearch sisteminde kişisel verileriniz (hesap şifreleri, arama geçmişi, yer imleri, oturum kayıtları) sunucu veri tabanlarında ASLA saklanmaz, kaydedilmez ve üçüncü taraflarla paylaşılmaz. Tüm profil ve hesap bilgileri kullanıcının kendi tarayıcısında şifrelenmiş (PBKDF2/SHA-256) olarak yerel depolanır.',
      },
      anti_abuse_lawful_use: {
        title: '7. Kötüye Kullanım ve Yasadışı Faaliyet Yasağı',
        text: 'Sistem altyapısını; siber saldırı, DDoS, kimlik avı (phishing), telif hakkı ihlali, çocuk istismarı, yetkisiz veri kazıma veya yürürlükteki yasalara aykırı herhangi bir amaçla kullanmak kesinlikle yasaktır. Tespiti durumunda oturum yerel olarak sonlandırılır.',
      },
      server_proxy_terms: {
        title: '8. Web Proxy ve Arama Sunucusu Kullanım Şartı',
        text: 'Dahili web proxy ve apisiz arama sunucusu, web sitelerinin kısıtlamalarını aşarak güvenli görüntüleme sunmak için tasarlanmıştır. Bu sunucu aracılığıyla yüklenen üçüncü taraf sayfaların içerik güvenliği, gizlilik politikaları ve kullanım şartları ilgili sitelerin kendilerine aittir.',
      },
    },
  },
  en: {
    title: 'Nova System Setup v54',
    subtitle: 'Mandatory User Verification, Strict Clauses & Security Agreement',
    noticeTitle: 'Strict Liability Disclaimer & Security Notice:',
    noticeBody: 'Producer Orhan Süleyman Torun and Nova Browser are ABSOLUTELY AND UNDER NO CIRCUMSTANCES RESPONSIBLE for ANY and all downloaded files, user actions, events, and their outcomes. The opening, executing, and consequences of all downloaded files and activities rest entirely and exclusively with the user.',
    acceptAll: 'Accept All Mandatory Clauses',
    submitButton: 'Initialize Nova v54 & Start Browsing',
    protocolText: 'Protocol',
    errorMsg: 'To proceed and access Nova Browser infrastructure, you must accept each mandatory clause individually or click "Accept All".',
    disclaimerTag: 'Strict Clause',
    originalButton: 'Original Turkish Text',
    translatedBadge: 'Live Translation Active',
    translatingNotice: 'Translating strict clauses via universal 145+ language engine...',
    searchLangPlaceholder: 'Search world languages (145+ languages)...',
    clauses: {
      producer_orhan_suleyman_torun_waiver: {
        title: '1. Producer Orhan Süleyman Torun and Strict Liability Disclaimer (Mandatory & Binding)',
        text: 'The creator, author, and producer of this application is Orhan Süleyman Torun. During the downloading, installation, execution, or use of this application via desktop or web; producer Orhan Süleyman Torun is ABSOLUTELY AND UNDER NO CIRCUMSTANCES LIABLE for ANY TYPE OF FILE downloaded by the user, websites visited, actions performed, potential data loss, virus or malware infections, hardware or software malfunctions, and any legal outcomes. Any user who downloads, installs, or uses this application hereby unconditionally, irrevocably, and in advance acknowledges, declares, and agrees that producer Orhan Süleyman Torun holds zero liability, and that all responsibilities rest entirely and exclusively upon the user.',
      },
      downloads_actions_liability: {
        title: '2. Strict Disclaimer of Liability for All Downloaded Files and User Actions (Non-Negotiable)',
        text: 'Producer Orhan Süleyman Torun and Nova Browser bear NO LIABILITY WHATSOEVER for any type of file downloaded (software, archives, documents, media, or executables) or any user actions, events, and transactions conducted via Nova Browser. Opening, executing, or using downloaded files, as well as any resulting virus, system damage, data loss, or legal consequence, is solely and entirely the user’s responsibility.',
      },
      liability_disclaimer: {
        title: '3. General Developer & Producer Disclaimer of Liability',
        text: 'Nova Browser and NovaSearch are independent web browser and search utilities. The developer and producer Orhan Süleyman Torun cannot be held liable for any content accessed, searched, downloaded, shared, or viewed through the browser or proxy server. All legal, civil, and criminal liability remains solely with the end user.',
      },
      age_parental_consent: {
        title: '4. Age Limitation and Mandatory Parental / Guardian Consent',
        text: 'To use this browser and search infrastructure, you must be of legal age, or if under 18, have the explicit consent and ongoing supervision of a legal parent or guardian. Parents are directly responsible for supervising sites accessed by minors.',
      },
      virus_malware_security: {
        title: '5. Virus, Malware & Cyber Defense Responsibility',
        text: 'While Nova Browser provides URL filtering and sandboxing protections, users must maintain their own up-to-date device security measures (antivirus, patched OS) against malware, trojans, ransomware, or cyber threats from external sites or downloads. Risks from executing third-party files are borne exclusively by the user.',
      },
      privacy_local_only: {
        title: '6. Personal Data & Zero-Knowledge Local Architecture',
        text: 'In Nova Browser and NovaSearch, personal data (passwords, search histories, bookmarks, session tokens) is NEVER stored or logged on remote servers, nor sold to third parties. All profile credentials remain locally encrypted (PBKDF2/SHA-256) inside the user’s browser storage.',
      },
      anti_abuse_lawful_use: {
        title: '7. Anti-Abuse and Strict Prohibition of Unlawful Activities',
        text: 'Using this browser system for cyber attacks, DDoS, phishing, copyright infringement, child exploitation, unauthorized scraping, or any unlawful activity is strictly prohibited. Violations will result in immediate local session termination.',
      },
      server_proxy_terms: {
        title: '8. Web Proxy and Search Engine Usage Terms',
        text: 'The built-in proxy and API-less search server are engineered to provide secure viewing and bypass restrictive site headers. Content safety, privacy policies, and terms of use for external third-party pages belong strictly to those respective websites.',
      },
    },
  },
  de: {
    title: 'Nova System-Setup v54',
    subtitle: 'Obligatorische Benutzerverifizierung, Strenge Klauseln & Sicherheitsvereinbarung',
    noticeTitle: 'Strikter Haftungsausschluss & Sicherheitshinweis:',
    noticeBody: 'Der Hersteller Orhan Süleyman Torun und Nova Browser übernehmen KEINERLEI HAFTUNG für alle heruntergeladenen Dateien, Benutzeraktionen, Ereignisse und deren Folgen. Das Öffnen, Ausführen und alle Konsequenzen heruntergeladener Dateien liegen ausschließlich beim Benutzer.',
    acceptAll: 'Alle obligatorischen Klauseln akzeptieren',
    submitButton: 'Nova v54 initialisieren & Browsen starten',
    protocolText: 'Protokoll',
    errorMsg: 'Um fortzufahren, müssen Sie alle oben genannten Klauseln einzeln oder über "Alle akzeptieren" bestätigen.',
    disclaimerTag: 'Strikte Klausel',
    originalButton: 'Originaler türkischer Text',
    translatedBadge: 'Live-Übersetzung aktiv',
    translatingNotice: 'Strikte Klauseln werden über 145+ Sprachsystem übersetzt...',
    searchLangPlaceholder: 'Weltsprachen durchsuchen (145+ Sprachen)...',
    clauses: {
      producer_orhan_suleyman_torun_waiver: {
        title: '1. Hersteller Orhan Süleyman Torun & Strikter Haftungsausschluss (Verbindlich & Zwingend)',
        text: 'Der Entwickler, Autor und Hersteller dieser Anwendung ist Orhan Süleyman Torun. Beim Herunterladen, Installieren, Ausführen oder Verwenden dieser Anwendung über Desktop oder Web haftet der Hersteller Orhan Süleyman Torun ABSOLUT BEI KEINEN UMSTÄNDEN für JEDE ART VON DATEI, die vom Benutzer heruntergeladen wird, für besuchte Websites, ausgeführte Aktionen, Datenverluste, Viren- oder Malware-Infektionen, Hard- oder Softwarefehler sowie rechtliche Konsequenzen. Jeder Benutzer, der diese Anwendung herunterlädt, installiert oder verwendet, erkennt unwiderruflich und im Voraus an, dass der Hersteller Orhan Süleyman Torun keinerlei Haftung trägt und die gesamte Verantwortung ausschließlich beim Benutzer liegt.',
      },
      downloads_actions_liability: {
        title: '2. Strikter Haftungsausschluss für heruntergeladene Dateien und Benutzeraktionen',
        text: 'Der Hersteller Orhan Süleyman Torun und Nova Browser haften in KEINER WEISE für heruntergeladene Dateien (Software, Archive, Dokumente, Medien, ausführbare Dateien) oder Handlungen des Nutzers. Viren, Schäden oder rechtliche Folgen liegen allein in der Verantwortung des Nutzers.',
      },
      liability_disclaimer: {
        title: '3. Allgemeiner Haftungsausschluss des Entwicklers & Herstellers',
        text: 'Nova Browser und NovaSearch sind unabhängige Werkzeuge. Der Entwickler und Hersteller Orhan Süleyman Torun haftet nicht für abgerufene, heruntergeladene oder angezeigte Inhalte. Die gesamte rechtliche Verantwortung liegt beim Nutzer.',
      },
      age_parental_consent: {
        title: '4. Altersbeschränkung & Zustimmung der Erziehungsberechtigten',
        text: 'Die Nutzung erfordert Volljährigkeit oder bei unter 18-Jährigen die ausdrückliche Aufsicht und Zustimmung der Eltern bzw. Erziehungsberechtigten.',
      },
      virus_malware_security: {
        title: '5. Viren- und Schadsoftware-Schutzverantwortung',
        text: 'Trotz Schutzfunktionen muss der Nutzer eigene Sicherheitsmaßnahmen (Antivirenprogramme, aktuelle Betriebssysteme) aufrechterhalten. Risiken externer Dateien trägt der Nutzer.',
      },
      privacy_local_only: {
        title: '6. Datenschutz & Zero-Knowledge Lokal-Speicherung',
        text: 'Passwörter, Verlauf und Lesezeichen werden NIEMALS auf Servern gespeichert. Alle Daten verbleiben lokal verschlüsselt auf dem Gerät des Nutzers.',
      },
      anti_abuse_lawful_use: {
        title: '7. Missbrauchs- und Gesetzwidrigkeitsverbot',
        text: 'Die Nutzung für Cyberangriffe, Phishing oder illegale Zwecke ist strengstens untersagt.',
      },
      server_proxy_terms: {
        title: '8. Web-Proxy und Suchserver-Bedingungen',
        text: 'Der Proxy dient der sicheren Anzeige. Die Verantwortung für Inhalte externer Websites liegt bei den jeweiligen Betreibern.',
      },
    },
  },
  fr: {
    title: 'Configuration Système Nova v54',
    subtitle: 'Vérification Obligatoire, Clauses Strictes & Accord de Sécurité',
    noticeTitle: 'Clause de Non-Responsabilité Stricte & Sécurité :',
    noticeBody: 'Le créateur Orhan Süleyman Torun et Nova Browser ne sont EN AUCUN CAS RESPONSABLES des fichiers téléchargés, des actions de l\'utilisateur et de leurs conséquences. L\'ouverture et l\'exécution des fichiers relèvent de la responsabilité exclusive de l\'utilisateur.',
    acceptAll: 'Accepter toutes les clauses obligatoires',
    submitButton: 'Initialiser Nova v54 & Démarrer la Navigation',
    protocolText: 'Protocole',
    errorMsg: 'Pour continuer, vous devez accepter toutes les clauses obligatoires ci-dessus.',
    disclaimerTag: 'Clause Stricte',
    originalButton: 'Texte Turc Original',
    translatedBadge: 'Traduction en direct active',
    translatingNotice: 'Traduction des clauses strictes en cours (145+ langues)...',
    searchLangPlaceholder: 'Rechercher une langue (145+ langues)...',
    clauses: {
      producer_orhan_suleyman_torun_waiver: {
        title: '1. Développeur Orhan Süleyman Torun et Décharge Totale de Responsabilité (Obligatoire et Stricte)',
        text: 'Le concepteur, auteur et créateur de cette application est Orhan Süleyman Torun. Lors du téléchargement, de l\'installation, de l\'exécution ou de l\'utilisation de cette application sur ordinateur ou sur le Web ; le créateur Orhan Süleyman Torun n\'est ABSOLUMENT ET EN AUCUN CAS RESPONSABLE de TOUT TYPE DE FICHIER téléchargé par l\'utilisateur, des sites visités, des opérations effectuées, des pertes de données, des infections par virus ou logiciels malveillants, des pannes matérielles ou logicielles et des conséquences juridiques. Tout utilisateur téléchargeant, installant ou utilisant cette application reconnaît, déclare et s\'engage de manière irrévocable et préalable que le créateur Orhan Süleyman Torun n\'assume aucune responsabilité et que l\'entière responsabilité incombe exclusivement à l\'utilisateur.',
      },
      downloads_actions_liability: {
        title: '2. Non-responsabilité stricte pour les fichiers téléchargés et les actions',
        text: 'Le créateur Orhan Süleyman Torun et Nova Browser déclinent toute responsabilité pour tout fichier téléchargé ou toute action entreprise. Tout risque de virus, perte de données ou dommage juridique incombe exclusivement à l\'utilisateur.',
      },
      liability_disclaimer: {
        title: '3. Clause générale de non-responsabilité du développeur',
        text: 'Nova Browser est un outil indépendant. Le développeur et créateur Orhan Süleyman Torun ne peut être tenu responsable des contenus consultés ou téléchargés.',
      },
      age_parental_consent: {
        title: '4. Limite d\'âge et accord parental obligatoire',
        text: 'Vous devez être majeur ou agir sous la surveillance expresse de vos parents ou tuteurs légaux.',
      },
      virus_malware_security: {
        title: '5. Protection contre les virus et logiciels malveillants',
        text: 'L\'utilisateur doit maintenir ses propres protections antivirus. Les risques liés à l\'exécution de fichiers externes incombent à l\'utilisateur.',
      },
      privacy_local_only: {
        title: '6. Données personnelles et stockage local Zero-Knowledge',
        text: 'Vos données personnelles et mots de passe ne sont JAMAIS stockés sur nos serveurs. Tout reste chiffré localement.',
      },
      anti_abuse_lawful_use: {
        title: '7. Interdiction d\'abus et d\'activités illégales',
        text: 'Toute utilisation à des fins cybercriminelles ou illicites est formellement prohibée.',
      },
      server_proxy_terms: {
        title: '8. Conditions du proxy web et du moteur de recherche',
        text: 'Le proxy sécurisé affiche les sites distants sans altérer les politiques des sites d\'origine.',
      },
    },
  },
  es: {
    title: 'Configuración del Sistema Nova v54',
    subtitle: 'Verificación Obligatoria de Usuario, Cláusulas Estrictas y Acuerdo de Seguridad',
    noticeTitle: 'Descargo de Responsabilidad Estricto y Aviso de Seguridad:',
    noticeBody: 'El creador Orhan Süleyman Torun y Nova Browser NO SON RESPONSABLES BAJO NINGUNA CIRCUNSTANCIA de los archivos descargados, las acciones del usuario y sus consecuencias. Abrir o ejecutar archivos descargados es responsabilidad exclusiva del usuario.',
    acceptAll: 'Aceptar todas las cláusulas obligatorias',
    submitButton: 'Inicializar Nova v54 y Comenzar a Navegar',
    protocolText: 'Protocolo',
    errorMsg: 'Para continuar, debe aceptar todas las cláusulas obligatorias anteriores.',
    disclaimerTag: 'Cláusula Estricta',
    originalButton: 'Texto Original en Turco',
    translatedBadge: 'Traducción en Vivo Activa',
    translatingNotice: 'Traduciendo cláusulas estrictas con el motor de 145+ idiomas...',
    searchLangPlaceholder: 'Buscar idiomas del mundo (145+ idiomas)...',
    clauses: {
      producer_orhan_suleyman_torun_waiver: {
        title: '1. Desarrollador Orhan Süleyman Torun y Exención Total de Responsabilidad (Obligatoria y Estricta)',
        text: 'El creador, autor y desarrollador de esta aplicación es Orhan Süleyman Torun. Durante la descarga, instalación, ejecución o uso de esta aplicación en escritorio o web; el desarrollador Orhan Süleyman Torun NO ES RESPONSABLE EN ABSOLUTO NI BAJO NINGUNA CIRCUNSTANCIA por CUALQUIER TIPO DE ARCHIVO descargado por el usuario, sitios web visitados, operaciones realizadas, pérdida de datos, infecciones de virus/malware, fallos de hardware o software y consecuencias legales. Todo usuario que descargue, instale o utilice esta aplicación reconoce, declara y acepta de forma irrevocable y por adelantado que el desarrollador Orhan Süleyman Torun no asume ninguna responsabilidad y que toda la responsabilidad recae única y exclusivamente en el usuario.',
      },
      downloads_actions_liability: {
        title: '2. Descargo estricto de responsabilidad por descargas y acciones',
        text: 'El creador Orhan Süleyman Torun y Nova Browser NO se hacen responsables bajo ningún concepto de los archivos descargados o acciones del usuario. Todo riesgo de virus, daños o consecuencias legales corresponde al usuario.',
      },
      liability_disclaimer: {
        title: '3. Descargo de responsabilidad general del creador',
        text: 'Nova Browser es una herramienta independiente. El desarrollador y creador Orhan Süleyman Torun no responde por contenidos visitados o descargados.',
      },
      age_parental_consent: {
        title: '4. Límite de edad y consentimiento parental',
        text: 'Debe ser mayor de edad o contar con la supervisión expresa de sus tutores legales.',
      },
      virus_malware_security: {
        title: '5. Seguridad contra virus y malware',
        text: 'El usuario debe contar con sus propias defensas de seguridad (antivirus y sistema operativo actualizado).',
      },
      privacy_local_only: {
        title: '6. Privacidad y almacenamiento local sin registros (Zero-Knowledge)',
        text: 'Sus contraseñas, historial y marcadores NUNCA se guardan en servidores remotos. Permanecen cifrados en su equipo.',
      },
      anti_abuse_lawful_use: {
        title: '7. Prohibición de abuso y actividades ilícitas',
        text: 'Queda terminantemente prohibido utilizar el sistema para ciberataques o fines ilegales.',
      },
      server_proxy_terms: {
        title: '8. Condiciones del proxy web y motor de búsqueda',
        text: 'El proxy web facilita la visualización segura. Las políticas de sitios externos corresponden a sus titulares.',
      },
    },
  },
  ru: {
    title: 'Настройка системы Nova v54',
    subtitle: 'Обязательная верификация, строгие пункты и соглашение о безопасности',
    noticeTitle: 'Строгий отказ от ответственности и уведомление о безопасности:',
    noticeBody: 'Разработчик Орхан Сюлейман Торун и Nova Browser КАТЕГОРИЧЕСКИ НЕ НЕСУТ ОТВЕТСТВЕННОСТИ за любые скачанные файлы, действия пользователя и их последствия. Запуск и использование файлов лежат исключительно на пользователе.',
    acceptAll: 'Принять все обязательные пункты',
    submitButton: 'Запустить Nova v54 и начать работу',
    protocolText: 'Протокол',
    errorMsg: 'Для продолжения необходимо принять все обязательные пункты выше.',
    disclaimerTag: 'Строгий пункт',
    originalButton: 'Оригинальный турецкий текст',
    translatedBadge: 'Живой перевод активен',
    translatingNotice: 'Перевод строгих пунктов на 145+ языков...',
    searchLangPlaceholder: 'Поиск по 145+ языкам мира...',
    clauses: {
      producer_orhan_suleyman_torun_waiver: {
        title: '1. Разработчик Орхан Сюлейман Торун и Полный отказ от ответственности (Строго и Обязательно)',
        text: 'Создателем, автором и разработчиком этого приложения является Орхан Сюлейман Торун (Orhan Süleyman Torun). При загрузке, установке, запуске или использовании этого приложения на ПК или в веб-версии разработчик Орхан Сюлейман Торун АБСОЛЮТНО И НИ ПРИ КАКИХ ОБСТОЯТЕЛЬСТВАХ НЕ НЕСЕТ ОТВЕТСТВЕННОСТИ за ЛЮБЫЕ ФАЙЛЫ, скачанные пользователем, посещенные сайты, совершенные действия, потерю данных, заражение вирусами или вредоносным ПО, аппаратные или программные сбои и юридические последствия. Каждый пользователь, скачивающий, устанавливающий или использующий это приложение, безоговорочно и заранее подтверждает, что разработчик Орхан Сюлейман Торун не несет никакой ответственности, а вся ответственность лежит исключительно на самом пользователе.',
      },
      downloads_actions_liability: {
        title: '2. Строгий отказ от ответственности за скачанные файлы и действия пользователя',
        text: 'Разработчик Орхан Сюлейман Торун и Nova Browser ни при каких обстоятельствах не несут ответственности за любые загруженные файлы и действия пользователя. Ответственность за вирусы, ущерб и правовые последствия несет исключительно пользователь.',
      },
      liability_disclaimer: {
        title: '3. Общий отказ от ответственности создателя и разработчика',
        text: 'Nova Browser является независимым инструментом. Создатель и разработчик Орхан Сюлейман Торун не несет ответственности за просматриваемые или скачиваемые ресурсы.',
      },
      age_parental_consent: {
        title: '4. Возрастное ограничение и согласие родителей',
        text: 'Для использования браузера вы должны быть совершеннолетним или действовать под прямым контролем родителей.',
      },
      virus_malware_security: {
        title: '5. Защита от вирусов и вредоносного ПО',
        text: 'Пользователь обязан самостоятельно использовать антивирусное ПО и обновлять операционную систему.',
      },
      privacy_local_only: {
        title: '6. Конфиденциальность и локальное хранилище (Zero-Knowledge)',
        text: 'Пароли и история НИКОГДА не отправляются на удаленные серверы. Все данные зашифрованы локально.',
      },
      anti_abuse_lawful_use: {
        title: '7. Запрет злоупотреблений и незаконной деятельности',
        text: 'Использование браузера в противоправных целях или для кибератак строго запрещено.',
      },
      server_proxy_terms: {
        title: '8. Условия использования веб-прокси и поиска',
        text: 'Прокси-сервер предназначен для безопасного просмотра сайтов с соблюдением правил сторонних ресурсов.',
      },
    },
  },
  ar: {
    title: 'إعداد نظام نوفا v54',
    subtitle: 'التحقق الإلزامي من المستخدم، الشروط الصارمة واتفاقية الأمان',
    noticeTitle: 'إخلاء مسؤولية صارم وإشعار أمني:',
    noticeBody: 'المطور أورهان سليمان تورون ومتصفح نوفا غير مسؤولين على الإطلاق وتحت أي ظرف عن أي ملفات يتم تنزيلها أو تصرفات يقوم بها المستخدم وعواقبها. يتحمل المستخدم بمفرده المسؤولية الكاملة عن فتح الملفات وتشغيلها.',
    acceptAll: 'الموافقة على جميع البنود الإلزامية',
    submitButton: 'تهيئة نوفا v54 وبدء التصفح',
    protocolText: 'بروتوكول',
    errorMsg: 'للمتابعة واستخدام المتصفح، يجب قبول جميع البنود الإلزامية المذكورة أعلاه.',
    disclaimerTag: 'بند صارم',
    originalButton: 'النص الأصلي بالتركية',
    translatedBadge: 'الترجمة الحية مفعلة',
    translatingNotice: 'جاري ترجمة البنود الصارمة عبر نظام 145+ لغة...',
    searchLangPlaceholder: 'البحث في لغات العالم (145+ لغة)...',
    clauses: {
      producer_orhan_suleyman_torun_waiver: {
        title: '1. المطور أورهان سليمان تورون وإخلاء المسؤولية الصارم (إلزامي وغير قابل للتفاوض)',
        text: 'المطور والمؤلف والمنشئ لهذا التطبيق هو أورهان سليمان تورون (Orhan Süleyman Torun). أثناء تنزيل هذا التطبيق أو تثبيته أو تشغيله أو استخدامه عبر سطح المكتب أو الويب؛ لا يتحمل المطور أورهان سليمان تورون أي مسؤولية على الإطلاق وتحت أي ظرف من الظروف عن أي نوع من الملفات التي يقوم المستخدم بتنزيلها، أو المواقع التي تتم زيارتها، أو الإجراءات المنفذة، أو فقدان البيانات المحتمل، أو الإصابة بالفيروسات والبرمجيات الخبيثة، أو الأعطال البرمجية والأجهزة والنتائج القانونية. يقر ويتعهد كل مستخدم يقوم بتنزيل هذا التطبيق أو تثبيته أو استخدامه مسبقًا وبشكل لا رجعة فيه بأن المطور لا يتحمل أي مسؤولية وأن المسؤولية الكاملة تقع حصريًا على عاتق المستخدم نفسه.',
      },
      downloads_actions_liability: {
        title: '2. إخلاء مسؤولية صارم عن الملفات التي تم تنزيلها وإجراءات المستخدم',
        text: 'المطور أورهان سليمان تورون ومتصفح نوفا غير مسؤولين بأي شكل من الأشكال عن أي ملفات يتم تنزيلها أو تصرفات يتخذها المستخدم. تقع جميع مخاطر الفيروسات أو الأضرار أو التبعات القانونية على عاتق المستخدم وحده.',
      },
      liability_disclaimer: {
        title: '3. إخلاء المسؤولية العامة للمطور والمنتج',
        text: 'نوفا هو أداة متصفح مستقلة. لا يتحمل المطور أورهان سليمان تورون أي مسؤولية عن أي محتوى يتم الوصول إليه أو تنزيله.',
      },
      age_parental_consent: {
        title: '4. الفئة العمرية وموافقة أولياء الأمور الإلزامية',
        text: 'يجب أن تكون في السن القانونية أو تحت إشراف صريح من والديك أو الأوصياء القانونيين.',
      },
      virus_malware_security: {
        title: '5. الحماية من الفيروسات والبرمجيات الخبيثة',
        text: 'يتعين على المستخدم الحفاظ على تدابير أمنية خاصة به (مكافحة فيروسات ونظام تشغيل محدث).',
      },
      privacy_local_only: {
        title: '6. الخصوصية والتخزين المحلي دون خوادم (Zero-Knowledge)',
        text: 'كلمات المرور وسجل البحث لا يتم تخزينها أبداً على الخوادم، بل تُشفر محلياً على جهازك.',
      },
      anti_abuse_lawful_use: {
        title: '7. حظر إساءة الاستخدام والأنشطة غير القانونية',
        text: 'يُحظر تماماً استخدام المتصفح للهجمات السيبرانية أو لأي غرض غير قانوني.',
      },
      server_proxy_terms: {
        title: '8. شروط استخدام البروكسي وخادم البحث',
        text: 'البروكسي مصمم لتوفير عرض آمن. تقع سياسات المواقع الخارجية على عاتق مواقعها الأصلية.',
      },
    },
  },
  zh: {
    title: 'Nova 系统设置 v54',
    subtitle: '强制用户验证、严格条款与安全协议',
    noticeTitle: '严格免责声明与安全声明：',
    noticeBody: '制作人 Orhan Süleyman Torun 及 Nova 浏览器开发团队对通过本浏览器下载的任何文件、用户执行的所有行为及其引发的任何后果绝对且在任何情况下均不承担任何责任。下载文件的打开、执行以及所有操作的后果完全由用户自行负责。',
    acceptAll: '接受所有强制条款',
    submitButton: '初始化 Nova v54 并开始浏览',
    protocolText: '协议',
    errorMsg: '要继续使用 Nova 浏览器，您必须逐项接受或点击“全部接受”上述所有强制条款。',
    disclaimerTag: '严格条款',
    originalButton: '原始土耳其语条款',
    translatedBadge: '实时翻译生效中',
    translatingNotice: '正在通过 145+ 语言翻译引擎翻译严格条款...',
    searchLangPlaceholder: '搜索世界各语言（145+ 种语言）...',
    clauses: {
      producer_orhan_suleyman_torun_waiver: {
        title: '1. 开发者 Orhan Süleyman Torun 与严格免责声明（强制性与严格确认）',
        text: '本应用程序的创作者、作者兼开发者为 Orhan Süleyman Torun。在通过桌面或网页端下载、安装、运行或使用本应用程序期间，开发者 Orhan Süleyman Torun 在任何情况下均绝对不对用户下载的任何类型文件、访问的网站、执行的操作、潜在的数据丢失、病毒/恶意软件感染、软硬件故障以及法律后果承担任何责任。任何下载、安装或使用本应用程序的用户在此无条件、不可撤销地预先承认、声明并承诺：开发者 Orhan Süleyman Torun 不承担任何责任，所有法律与操作责任完全且唯一由用户自行承担。',
      },
      downloads_actions_liability: {
        title: '2. 对所有下载文件与用户行为的严格免责声明（确定性条款）',
        text: '制作人 Orhan Süleyman Torun 与 Nova 浏览器对用户下载的任何文件（软件、文档、媒体或可执行程序）以及用户开展的所有行为均不承担任何责任。下载文件的运行风险、病毒侵害、数据损坏或法律责任均全权由用户承担。',
      },
      liability_disclaimer: {
        title: '3. 开发者与制作方一般免责声明',
        text: 'Nova 浏览器是独立的网络浏览工具。制作人 Orhan Süleyman Torun 对用户访问、搜索、下载或查看的任何第三方内容概不负责。',
      },
      age_parental_consent: {
        title: '4. 年龄限制与监护人许可要求',
        text: '使用本浏览器须达到法定成年年龄；未满18周岁的用户须在法定监护人的明确许可和指导下使用。',
      },
      virus_malware_security: {
        title: '5. 病毒、恶意软件与网络安全防护责任',
        text: '用户有责任在自身设备上配备最新的防病毒软件和系统安全补丁。运行外部文件的风险完全由用户自负。',
      },
      privacy_local_only: {
        title: '6. 个人数据与零知识本地加密存储 (Zero-Knowledge)',
        text: '密码、历史记录和书签绝不会上传至远程服务器，全部在用户本地加密保存。',
      },
      anti_abuse_lawful_use: {
        title: '7. 禁止滥用与违法活动',
        text: '严禁将本系统用于网络攻击、钓鱼欺诈或任何违反现行法律的行为。',
      },
      server_proxy_terms: {
        title: '8. Web 代理与搜索服务使用条款',
        text: '内置代理旨在提供安全浏览。第三方网页的内容政策与使用条款归相应网站所有。',
      },
    },
  },
  ja: {
    title: 'Nova システムセットアップ v54',
    subtitle: '必須ユーザー確認・厳格な免責事項およびセキュリティ合意書',
    noticeTitle: '厳格な免責事項およびセキュリティ通知：',
    noticeBody: '製作者 Orhan Süleyman Torun および Nova Browser は、ダウンロードされたすべてのファイル、ユーザーによるすべての行動およびその結果について、いかなる場合も一切の責任を負いません。ダウンロードしたファイルの開封、実行、およびすべての行為の責任は専らユーザー自身に帰属します。',
    acceptAll: 'すべての必須条項に同意する',
    submitButton: 'Nova v54 を初期化してブラウジングを開始',
    protocolText: 'プロトコル',
    errorMsg: '続行するには、上記のすべての必須条項に同意する必要があります。',
    disclaimerTag: '厳格条項',
    originalButton: '元のトルコ語テキスト',
    translatedBadge: 'リアルタイム翻訳有効',
    translatingNotice: '145+言語エンジンで厳格条項を翻訳中...',
    searchLangPlaceholder: '世界の言語を検索（145+言語）...',
    clauses: {
      producer_orhan_suleyman_torun_waiver: {
        title: '1. 開発者 Orhan Süleyman Torun および完全免責事項（必須・厳格同意）',
        text: '本アプリケーションの作成者および開発者は Orhan Süleyman Torun です。本アプリのダウンロード、インストール、実行、またはPC／Webを介した利用において、ユーザーがダウンロードしたあらゆるファイル、アクセスしたサイト、行われた操作、データの損失、ウイルス・マルウェアの感染、ハードウェアまたはソフトウェアの障害、法的結果について、開発者 Orhan Süleyman Torun は一切の責任を負いません。本アプリをダウンロード、インストール、または使用するすべてのユーザーは、開発者が一切の責任を負わず、すべての責任が完全にユーザー自身にあることを、事前かつ取消不能に承諾・表明・保証するものとします。',
      },
      downloads_actions_liability: {
        title: '2. ダウンロードファイルおよびユーザー行為に関する厳格な免責事項',
        text: '製作者 Orhan Süleyman Torun および Nova Browser は、ダウンロードされたファイルやユーザーのすべての行為に関して一切責任を負いません。ウイルス、データの損失、法的責任はすべてユーザーが負うものとします。',
      },
      liability_disclaimer: {
        title: '3. 開発者・制作者の一般的免責事項',
        text: 'Nova Browserは独立したツールです。閲覧またはダウンロードされたコンテンツについて製作者 Orhan Süleyman Torun は責任を負いません。',
      },
      age_parental_consent: {
        title: '4. 年齢制限および保護者の同意要件',
        text: '成人に達しているか、18歳未満の場合は保護者の明確な同意と監督のもとでのみ利用可能です。',
      },
      virus_malware_security: {
        title: '5. ウイルス・マルウェア対策の責任',
        text: 'ユーザーは自身のデバイスでウイルス対策ソフト等を適切に運用する責任を負います。',
      },
      privacy_local_only: {
        title: '6. 個人データとゼロナレッジ・ローカル保存',
        text: 'パスワードや履歴はサーバーに送信されず、ユーザーの端末上に暗号化されて安全に保持されます。',
      },
      anti_abuse_lawful_use: {
        title: '7. 不正利用および違法行為の禁止',
        text: 'サイバー攻撃や違法行為への利用は固く禁止されています。',
      },
      server_proxy_terms: {
        title: '8. Webプロキシおよび検索サーバーの利用条件',
        text: 'プロキシは安全な表示のためのものであり、外部サイトの規約はそのサイトに準拠します。',
      },
    },
  },
  az: {
    title: 'Nova Sistem Quraşdırması v54',
    subtitle: 'Məcburi İstifadəçi Təsdiqi, Qəti Maddələr və Təhlükəsizlik Razılaşması',
    noticeTitle: 'Qəti Məsuliyyətdən İmtina və Təhlükəsizlik Bildirişi:',
    noticeBody: 'Yaradıcı Orhan Süleyman Torun və Nova Browser vasitəsilə yüklənən və edilən BÜTÜN HADİSƏLƏRDƏN, fayllardan, əməliyyatlardan və nəticələrindən QƏTİYYƏN VƏ HEÇ BİR ŞƏKİLDƏ MƏSULİYYƏT DAŞIMIR. Yüklənən faylların açılması və görülən işlərin məsuliyyəti yalnız istifadəçiyə aiddir.',
    acceptAll: 'Bütün Məcburi Maddələri Qəbul Et',
    submitButton: 'Nova v54 Başlat və Baxışa Başla',
    protocolText: 'Protokol',
    errorMsg: 'Davam etmək üçün yuxarıdakı bütün məcburi maddələri qəbul etməlisiniz.',
    disclaimerTag: 'Qəti Höküm',
    originalButton: 'Orijinal Türkcə Mətn',
    translatedBadge: 'Canlı Tərcümə Aktivdir',
    translatingNotice: '145+ dil sistemi ilə qəti maddələr tərcümə olunur...',
    searchLangPlaceholder: 'Dünya dillərində axtar (145+ Dil)...',
    clauses: {
      producer_orhan_suleyman_torun_waiver: {
        title: '1. Yaradıcı Orhan Süleyman Torun və Qəti Məsuliyyətsizlik Bəyanatı (Məcburi və Ciddi Təsdiq)',
        text: 'Bu tətbiqin yaradıcısı və müəllifi Orhan Süleyman Torun\'dur. Tətbiqin endirilməsi, quraşdırılması, işə salınması, masaüstü və ya veb üzərindən istifadəsi zamanı; istifadəçi tərəfindən endirilən HƏR CÜR FAYLDAN, daxil olunan saytlardan, həyata keçirilən əməliyyatlardan, yarana biləcək məlumat itkilərindən, virus/zərərli proqram yoluxmalarından, aparat və ya proqram təminatı nasazlıqlarından və hüquqi nəticələrdən yaradıcı Orhan Süleyman Torun QƏTİYYƏN VƏ HEÇ BİR HALDA MƏSULİYYƏT DAŞIMIR. Bu tətbiqi endirmək, quraşdırmaq və ya istifadə etmək istəyən hər bir istifadəçi yaradıcı Orhan Süleyman Torun\'un heç bir məsuliyyət daşımadığını və bütün məsuliyyətin tamamilə özünə aid olduğunu qabaqcadan və geri dönməz şəkildə qəbul, bəyan və öhdəsinə götürür.',
      },
      downloads_actions_liability: {
        title: '2. Yüklənən Fayllar və Edilən Bütün Hadisələrdən Məsuliyyətsizlik İmtinası (Qəti Höküm)',
        text: 'Yaradıcı Orhan Süleyman Torun və Nova Browser vasitəsilə yüklənən HƏR CÜR FAYLDAN və istifadəçi tərəfindən həyata keçirilən BÜTÜN HADİSƏLƏRDƏN QƏTİYYƏN MƏSULİYYƏT DAŞIMIR. Bütün məsuliyyət yalnız istifadəçiyə aiddir.',
      },
      liability_disclaimer: {
        title: '3. Tərtibatçı Ümumi Məsuliyyətdən İmtina',
        text: 'Nova Browser müstəqil veb brauzer alətidir. İstifadəçinin daxil olduğu və ya yüklədiyi heç bir məzmundan yaradıcı Orhan Süleyman Torun məsuliyyət daşımır.',
      },
      age_parental_consent: {
        title: '4. Yaş Həddi və Valideyn İcazəsi Şərti',
        text: 'Bu brauzerdən istifadə etmək üçün yetkinlik yaşına çatmış olmalı və ya 18 yaşından kiçiksinizsə valideyninizin nəzarəti altında olmalısınız.',
      },
      virus_malware_security: {
        title: '5. Virus və Zərərli Proqram Təhlükəsizliyi',
        text: 'İstifadəçi öz cihazının təhlükəsizliyini (antivirus və yenilənmiş əməliyyat sistemi) təmin etmək məcburiyyətindədir.',
      },
      privacy_local_only: {
        title: '6. Fərdi Məlumatlar və Sıfır Qeydiyyat (Zero-Knowledge)',
        text: 'Şifrələriniz və tarixçəniz heç vaxt serverlərdə saxlanmır, cihazınızda şifrələnmiş qalır.',
      },
      anti_abuse_lawful_use: {
        title: '7. Qanunsuz Fəaliyyətlərin Qadağası',
        text: 'Sistemdən kiberhücumlar və ya qanunsuz məqsədlər üçün istifadə qəti qadağandır.',
      },
      server_proxy_terms: {
        title: '8. Veb Proksi və Axtarış İstifadə Qaydaları',
        text: 'Daxili proksi təhlükəsiz baxış üçündür. Xarici saytların qaydaları özlərinə aiddir.',
      },
    },
  },
  it: {
    title: 'Configurazione Sistema Nova v54',
    subtitle: 'Verifica Utente Obbligatoria, Clausole Rigide & Accordo di Sicurezza',
    noticeTitle: 'Esclusione di Responsabilità Rigida & Avviso di Sicurezza:',
    noticeBody: 'Il creatore Orhan Süleyman Torun e Nova Browser non sono IN NESSUN CASO RESPONSABILI per tutti i file scaricati, le azioni dell\'utente e le loro conseguenze. L\'apertura o l\'esecuzione dei file scaricati ricade sotto l\'esclusiva responsabilità dell\'utente.',
    acceptAll: 'Accetta tutte le clausole obbligatorie',
    submitButton: 'Inizializza Nova v54 e Inizia la Navigazione',
    protocolText: 'Protocollo',
    errorMsg: 'Per continuare è necessario accettare tutte le clausole obbligatorie.',
    disclaimerTag: 'Clausola Rigida',
    originalButton: 'Testo originale in turco',
    translatedBadge: 'Traduzione live attiva',
    translatingNotice: 'Traduzione delle clausole con sistema 145+ lingue...',
    searchLangPlaceholder: 'Cerca tra le lingue del mondo (145+ lingue)...',
    clauses: {
      producer_orhan_suleyman_torun_waiver: {
        title: '1. Sviluppatore Orhan Süleyman Torun e Dichiarazione Rigida di Esclusione di Responsabilità (Obbligatoria)',
        text: 'L\'autore, sviluppatore e creatore di questa applicazione è Orhan Süleyman Torun. Durante il download, l\'installazione, l\'esecuzione o l\'uso di questa applicazione su desktop o web; lo sviluppatore Orhan Süleyman Torun non è ASSOLUTAMENTE E IN NESSUN CASO RESPONSABILE per QUALSIASI TIPO DI FILE scaricato dall\'utente, per i siti visitati, le azioni eseguite, perdite di dati, infezioni da virus/malware, guasti hardware o software e conseguenze legali. Qualsiasi utente che scarichi, installi o utilizzi questa applicazione riconosce, dichiara e accetta irrevocabilmente e in anticipo che lo sviluppatore non assume alcuna responsabilità e che ogni responsabilità ricade unicamente ed esclusivamente sull\'utente.',
      },
      downloads_actions_liability: {
        title: '2. Esclusione totale di responsabilità per file scaricati e azioni',
        text: 'Il creatore Orhan Süleyman Torun e Nova Browser non rispondono di alcun file scaricato o azione compiuta dall\'utente. Qualsiasi rischio di virus o danno legale compete solo all\'utente.',
      },
      liability_disclaimer: {
        title: '3. Esclusione generale di responsabilità del creatore',
        text: 'Nova Browser è uno strumento indipendente. Il creatore Orhan Süleyman Torun non è responsabile dei contenuti visualizzati o scaricati.',
      },
      age_parental_consent: {
        title: '4. Limite di età e consenso genitoriale',
        text: 'È necessario essere maggiorenni o utilizzare il browser sotto la supervisione espressa dei genitori.',
      },
      virus_malware_security: {
        title: '5. Protezione da virus e malware',
        text: 'L\'utente deve provvedere autonomamente alle protezioni di sicurezza (antivirus e sistema operativo aggiornato).',
      },
      privacy_local_only: {
        title: '6. Privacy e archiviazione locale cifrata (Zero-Knowledge)',
        text: 'Password e cronologia non vengono MAI salvate su server remoti, ma rimangono crittografate sul dispositivo.',
      },
      anti_abuse_lawful_use: {
        title: '7. Divieto di abusi e attività illecite',
        text: 'L\'uso del sistema per attacchi informatici o scopi illegali è rigorosamente vietato.',
      },
      server_proxy_terms: {
        title: '8. Condizioni del proxy web e motore di ricerca',
        text: 'Il proxy consente una navigazione sicura rispettando le condizioni dei siti terzi visitati.',
      },
    },
  },
  pt: {
    title: 'Configuração do Sistema Nova v54',
    subtitle: 'Verificação Obrigatória de Usuário, Cláusulas Estritas & Acordo de Segurança',
    noticeTitle: 'Aviso Estrito de Isenção de Responsabilidade & Segurança:',
    noticeBody: 'O desenvolvedor Orhan Süleyman Torun e o Nova Browser NÃO SÃO EM HIPÓTESE ALGUMA RESPONSÁVEIS por arquivos baixados, ações do usuário e suas consequências. O download e a execução de arquivos são de responsabilidade exclusiva do usuário.',
    acceptAll: 'Aceitar todas as cláusulas obrigatórias',
    submitButton: 'Inicializar Nova v54 e Iniciar Navegação',
    protocolText: 'Protocolo',
    errorMsg: 'Para prosseguir, você deve aceitar todas as cláusulas obrigatórias acima.',
    disclaimerTag: 'Cláusula Estrita',
    originalButton: 'Texto original em turco',
    translatedBadge: 'Tradução ao vivo ativa',
    translatingNotice: 'Traduzindo cláusulas estritas com motor de 145+ idiomas...',
    searchLangPlaceholder: 'Pesquisar idiomas do mundo (145+ idiomas)...',
    clauses: {
      producer_orhan_suleyman_torun_waiver: {
        title: '1. Desenvolvedor Orhan Süleyman Torun e Isenção Estrita de Responsabilidade (Obrigatória e Vinculante)',
        text: 'O criador, autor e desenvolvedor deste aplicativo é Orhan Süleyman Torun. Durante o download, instalação, execução ou uso deste aplicativo via desktop ou web; o desenvolvedor Orhan Süleyman Torun NÃO É ABSOLUTAMENTE E EM NENHUMA HIPÓTESE RESPONSÁVEL por QUALQUER TIPO DE ARQUIVO baixado pelo usuário, sites acessados, ações executadas, perda de dados, infecções por vírus/malware, falhas de hardware ou software e consequências jurídicas. Qualquer usuário que baixe, instale ou use este aplicativo reconhece, declara e aceita irrevogavelmente e antecipadamente que o desenvolvedor não possui qualquer responsabilidade e que toda a responsabilidade pertence única e exclusivamente ao próprio usuário.',
      },
      downloads_actions_liability: {
        title: '2. Isenção total de responsabilidade por downloads e ações',
        text: 'O desenvolvedor Orhan Süleyman Torun e o Nova Browser não se responsabilizam por arquivos baixados ou ações executadas. Danos por vírus ou perdas de dados são de responsabilidade do usuário.',
      },
      liability_disclaimer: {
        title: '3. Isenção geral de responsabilidade do desenvolvedor',
        text: 'O Nova Browser é um utilitário independente. O desenvolvedor Orhan Süleyman Torun não responde por conteúdos externos acessados.',
      },
      age_parental_consent: {
        title: '4. Idade mínima e consentimento dos pais',
        text: 'O uso exige maioridade legal ou autorização expressa dos pais ou responsáveis.',
      },
      virus_malware_security: {
        title: '5. Proteção contra vírus e ameaças cibernéticas',
        text: 'O usuário deve manter seus próprios sistemas de segurança e antivírus atualizados.',
      },
      privacy_local_only: {
        title: '6. Privacidade e dados locais (Zero-Knowledge)',
        text: 'Senhas e histórico nunca são enviados para servidores remotos, permanecendo criptografados no dispositivo.',
      },
      anti_abuse_lawful_use: {
        title: '7. Proibição de abusos e condutas ilícitas',
        text: 'É estritamente proibido o uso para ataques virtuais ou atividades ilegais.',
      },
      server_proxy_terms: {
        title: '8. Termos do proxy web e servidor de busca',
        text: 'O proxy foi criado para garantir visualização segura com respeito aos termos originais.',
      },
    },
  },
};

// Memory & LocalStorage Dynamic Cache for live translated languages
const dynamicConsentCache: Record<string, ConsentTranslationData> = {};

export function getCachedConsentTranslation(langCode: string): ConsentTranslationData | null {
  const code = (langCode || 'tr').toLowerCase();
  const primary = code.split('-')[0];

  if (PRECOMPILED_CONSENT_TRANSLATIONS[code]) {
    return PRECOMPILED_CONSENT_TRANSLATIONS[code];
  }
  if (PRECOMPILED_CONSENT_TRANSLATIONS[primary]) {
    return PRECOMPILED_CONSENT_TRANSLATIONS[primary];
  }
  if (dynamicConsentCache[code]) {
    return dynamicConsentCache[code];
  }

  try {
    const raw = localStorage.getItem(`nova_consent_lang_${code}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      dynamicConsentCache[code] = parsed;
      return parsed;
    }
  } catch {}

  return null;
}

export function saveDynamicConsentTranslation(langCode: string, data: ConsentTranslationData): void {
  const code = (langCode || 'tr').toLowerCase();
  dynamicConsentCache[code] = data;
  try {
    localStorage.setItem(`nova_consent_lang_${code}`, JSON.stringify(data));
  } catch {}
}

/**
 * Universal dynamic translator for strict clauses into ANY of the 145+ world languages
 */
export async function fetchLiveConsentTranslation(targetLang: string): Promise<ConsentTranslationData> {
  const code = (targetLang || 'tr').toLowerCase();
  const primary = code.split('-')[0];

  if (code === 'tr') {
    return PRECOMPILED_CONSENT_TRANSLATIONS.tr;
  }

  // If already available precompiled
  if (PRECOMPILED_CONSENT_TRANSLATIONS[code]) {
    return PRECOMPILED_CONSENT_TRANSLATIONS[code];
  }
  if (PRECOMPILED_CONSENT_TRANSLATIONS[primary]) {
    return PRECOMPILED_CONSENT_TRANSLATIONS[primary];
  }

  // Check cache
  const cached = getCachedConsentTranslation(code);
  if (cached) return cached;

  // Master source is always the pristine Turkish master
  const base = PRECOMPILED_CONSENT_TRANSLATIONS.tr;

  try {
    const toTranslate = [
      base.title,
      base.subtitle,
      base.noticeTitle,
      base.noticeBody,
      base.acceptAll,
      base.submitButton,
      base.errorMsg,
      ...MANDATORY_CONSENTS.map((c) => (base.clauses[c.id]?.title || c.title)),
      ...MANDATORY_CONSENTS.map((c) => (base.clauses[c.id]?.text || c.text)),
    ];

    const res = await fetch('/api/translate-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        texts: toTranslate,
        from: 'tr',
        to: code,
      }),
    });

    if (res.ok) {
      const result = await res.json();
      if (result.success && Array.isArray(result.translations) && result.translations.length === toTranslate.length) {
        const parts = result.translations;
        let ptr = 0;
        const translatedTitle = parts[ptr++] || base.title;
        const translatedSubtitle = parts[ptr++] || base.subtitle;
        const translatedNoticeTitle = parts[ptr++] || base.noticeTitle;
        const translatedNoticeBody = parts[ptr++] || base.noticeBody;
        const translatedAcceptAll = parts[ptr++] || base.acceptAll;
        const translatedSubmit = parts[ptr++] || base.submitButton;
        const translatedError = parts[ptr++] || base.errorMsg;

        const titles: string[] = [];
        for (let i = 0; i < MANDATORY_CONSENTS.length; i++) {
          titles.push(parts[ptr++] || base.clauses[MANDATORY_CONSENTS[i].id]?.title || MANDATORY_CONSENTS[i].title);
        }

        const translatedClauses: Record<string, { title: string; text: string }> = {};
        for (let i = 0; i < MANDATORY_CONSENTS.length; i++) {
          const clauseId = MANDATORY_CONSENTS[i].id;
          translatedClauses[clauseId] = {
            title: titles[i] || MANDATORY_CONSENTS[i].title,
            text: parts[ptr++] || base.clauses[clauseId]?.text || MANDATORY_CONSENTS[i].text,
          };
        }

        const finalData: ConsentTranslationData = {
          title: translatedTitle,
          subtitle: translatedSubtitle,
          noticeTitle: translatedNoticeTitle,
          noticeBody: translatedNoticeBody,
          acceptAll: translatedAcceptAll,
          submitButton: translatedSubmit,
          protocolText: base.protocolText,
          errorMsg: translatedError,
          disclaimerTag: 'Katı Hüküm / Strict Clause',
          originalButton: 'Orijinal Türkçe Metin',
          translatedBadge: `Canlı Çeviri (${code.toUpperCase()})`,
          translatingNotice: 'Çevrildi',
          searchLangPlaceholder: 'Dünya dillerinde ara (145+ Dil)...',
          clauses: translatedClauses,
        };

        saveDynamicConsentTranslation(code, finalData);
        return finalData;
      }
    }
  } catch (err) {
    console.warn('Live consent translation failed, using fallback:', err);
  }

  // Fallback
  return PRECOMPILED_CONSENT_TRANSLATIONS.en || PRECOMPILED_CONSENT_TRANSLATIONS.tr;
}

/**
 * Translates a single clause dynamically into ANY target language with immediate caching
 */
export async function translateSingleClauseLive(
  clauseId: string,
  targetLang: string
): Promise<{ title: string; text: string }> {
  const target = (targetLang || 'tr').toLowerCase();
  const trBase = PRECOMPILED_CONSENT_TRANSLATIONS.tr.clauses[clauseId];
  if (!trBase) {
    const item = MANDATORY_CONSENTS.find((c) => c.id === clauseId);
    return { title: item?.title || '', text: item?.text || '' };
  }
  if (target === 'tr') return trBase;

  // Check precompiled
  const precompiled =
    PRECOMPILED_CONSENT_TRANSLATIONS[target] ||
    PRECOMPILED_CONSENT_TRANSLATIONS[target.split('-')[0]];
  if (precompiled?.clauses[clauseId]) {
    return precompiled.clauses[clauseId];
  }

  // Check full cache
  const cachedFull = getCachedConsentTranslation(target);
  if (cachedFull?.clauses[clauseId]) {
    return cachedFull.clauses[clauseId];
  }

  try {
    const res = await fetch('/api/translate-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        texts: [trBase.title, trBase.text],
        from: 'tr',
        to: target,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.translations) && data.translations.length === 2) {
        return {
          title: data.translations[0] || trBase.title,
          text: data.translations[1] || trBase.text,
        };
      }
    }
  } catch {}

  return PRECOMPILED_CONSENT_TRANSLATIONS.en?.clauses[clauseId] || trBase;
}
