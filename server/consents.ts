export interface ConsentItem {
  id: string;
  title: string;
  category: 'legal' | 'privacy' | 'security' | 'safety';
  icon: string;
  text: string;
  required: boolean;
}

export const MANDATORY_CONSENT_VERSION = 'v54.4-orhan-suleyman-torun-full-waiver';

export const MANDATORY_CONSENTS: ConsentItem[] = [
  {
    id: 'producer_orhan_suleyman_torun_waiver',
    title: '1. Yapımcı Orhan Süleyman Torun ve Kesin Sorumsuzluk Beyanı (Zorunlu ve Katı Onay)',
    category: 'legal',
    icon: 'ShieldAlert',
    text: 'Bu uygulamanın yapımcısı ve yazarı Orhan Süleyman Torun\'dur. Uygulamanın indirilmesi, kurulması, çalıştırılması, masaüstü veya web üzerinden kullanımı sırasında; kullanıcı tarafından indirilen HER TÜRLÜ DOSYADAN, girilen sitelerden, yapılan işlemlerden, doğabilecek veri kayıplarından, virüs/zararlı yazılım bulaşmalarından, donanımsal veya yazılımsal arızalardan ve hukuki sonuçlardan yapımcı Orhan Süleyman Torun KESİNLİKLE VE HİÇBİR KOŞULDA SORUMLU DEĞİLDİR. Bu uygulamayı indirmek, kurmak veya kullanmak isteyen her kullanıcı yapımcı Orhan Süleyman Torun\'un hiçbir sorumluluğu olmadığını ve tüm sorumluluğun tamamen kendisine ait olduğunu peşinen ve gayrikabili rücu kabul, beyan ve taahhüt eder.',
    required: true
  },
  {
    id: 'downloads_actions_liability',
    title: '2. İndirilen Dosyalar ve Yapılan Bütün Olaylardan Sorumsuzluk Reddi',
    category: 'legal',
    icon: 'ShieldAlert',
    text: 'Nova Browser üzerinden indirilen HER TÜRLÜ DOSYADAN (yazılım, arşiv, belge, medya veya çalıştırılabilir programlar) ve kullanıcı tarafından gerçekleştirilen YAPILAN BÜTÜN OLAYLARDAN, eylemlerden ve işlemlerden yapımcı Orhan Süleyman Torun ve Nova Browser HİÇBİR ŞEKİLDE SORUMLU DEĞİLDİR. İndirilen dosyaların açılması, kullanılması veya sistemde oluşturabileceği virüs, hasar, veri kaybı ve hukuki sorumluluklar münhasıran ve tamamen kullanıcıya aittir.',
    required: true
  },
  {
    id: 'liability_disclaimer',
    title: '3. Genel Sorumluluk Reddi ve Hukuki Muafiyet',
    category: 'legal',
    icon: 'FileWarning',
    text: 'Nova Browser ve NovaSearch bağımsız bir web tarayıcısı ve arama motoru aracıdır. Kullanıcının tarayıcı üzerinden eriştiği, arattığı, indirdiği, paylaştığı veya görüntülediği hiçbir içerikten veya üçüncü taraf web sitesinden yapımcı Orhan Süleyman Torun sorumlu tutulamaz. Tüm hukuki, cezai ve idari sorumluluk münhasıran kullanıcıya aittir.',
    required: true
  },
  {
    id: 'age_parental_consent',
    title: '4. Yaş Sınırı ve Ebeveyn / Veli İzni Şartı',
    category: 'safety',
    icon: 'UserCheck',
    text: 'Bu tarayıcıyı ve arama sunucusunu kullanabilmek için reşit olmanız veya 18 yaşın altındaysanız yasal ebeveyninizin/velinizin açık izni ve gözetimi altında olmanız zorunludur. Ebeveynler, çocuklarının ziyaret ettiği sitelerin denetiminden doğrudan sorumludur.',
    required: true
  },
  {
    id: 'virus_malware_security',
    title: '5. Virüs, Kötü Amaçlı Yazılım ve Siber Güvenlik Koruması',
    category: 'security',
    icon: 'Lock',
    text: 'Tarayıcı, zararlı URL filtreleme ve sandbox koruması sağlamakla birlikte, internet üzerindeki üçüncü taraf sitelerden indirilen dosyalardan, scriptlerden veya harici kaynaklardan kaynaklanabilecek virüs, truva atı, fidye yazılımı ve siber tehditlere karşı kullanıcının kendi cihaz güvenlik önlemlerini (antivirüs, güncel işletim sistemi) alması zorunludur. Dış kaynaklı dosya çalıştırmalarından doğacak risk kullanıcıya aittir.',
    required: true
  },
  {
    id: 'privacy_local_only',
    title: '6. Kişisel Veriler ve Sıfır-Günlük (Local-Only Zero-Knowledge)',
    category: 'privacy',
    icon: 'EyeOff',
    text: 'Nova Browser ve NovaSearch sisteminde kişisel verileriniz (hesap şifreleri, arama geçmişi, yer imleri, oturum kayıtları) sunucu veri tabanlarında ASLA saklanmaz, kaydedilmez ve üçüncü taraflarla paylaşılmaz. Tüm profil ve hesap bilgileri kullanıcının kendi tarayıcısında şifrelenmiş (PBKDF2/SHA-256) olarak yerel depolanır.',
    required: true
  },
  {
    id: 'anti_abuse_lawful_use',
    title: '7. Kötüye Kullanım ve Yasadışı Faaliyet Yasağı',
    category: 'legal',
    icon: 'ShieldAlert',
    text: 'Sistem altyapısını; siber saldırı, DDoS, kimlik avı (phishing), telif hakkı ihlali, çocuk istismarı, yetkisiz veri kazıma veya yürürlükteki yasalara aykırı herhangi bir amaçla kullanmak kesinlikle yasaktır. Tespiti durumunda oturum yerel olarak sonlandırılır.',
    required: true
  },
  {
    id: 'server_proxy_terms',
    title: '8. Web Proxy ve Arama Sunucusu Kullanım Şartı',
    category: 'security',
    icon: 'Server',
    text: 'Dahili web proxy ve apisiz arama sunucusu, web sitelerinin kısıtlamalarını aşarak güvenli görüntüleme sunmak için tasarlanmıştır. Bu sunucu aracılığıyla yüklenen üçüncü taraf sayfaların içerik güvenliği, gizlilik politikaları ve kullanım şartları ilgili sitelerin kendilerine aittir.',
    required: true
  }
];
