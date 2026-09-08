🚀 Nova Browser V54 — Resmi Kullanım Kılavuzu

Geliştirici: Orhan Süleyman Torun
Sürüm: V54 (Ultra Hızlı Web Tarayıcısı & NovaSearch Engine)
Mimari: Node.js, Express, TypeScript (tsx), CORS-Bypass, İzole Uygulama Modu

📌 İçindekiler

1.  Sistem Gereksinimleri
2.  Hızlı Kurulum (Windows, Mac, Linux)
3.  Tarayıcıyı Başlatma ve Çalışma Mantığı
4.  YouTube HD ve Engelsiz Video Motoru
5.  Dinamik Shorts & Reels Deneyimi
6.  Chrome Tarzı Evrensel Medya Kontrol Merkezi
7.  Pencere İçinde Pencere (PiP / Mini Oynatıcı)
8.  Hesap Yönetimi & Profil Değiştirme
9.  API & Entegrasyon Yönetimi (YouTube, Gemini AI)
10. Kısayol Tuşları ve İpuçları
11. Sıkça Sorulan Sorular ve Sorun Giderme

1. Sistem Gereksinimleri

  - İşletim Sistemi: Windows 10/11, macOS (Intel & Apple Silicon M1/M2/M3/M4),
    Tüm Linux Dağıtımları (Ubuntu, Debian, Fedora, Arch vb.)
  - Node.js: v18.0.0 veya üzeri (v20, v22 veya v24 önerilir)
  - İnternet Bağlantısı: Canlı video akışı ve arama motoru için gereklidir.

2. Hızlı Kurulum

🪟 Windows İçin Kurulum:

1.  Proje klasöründeki setup_windows.bat dosyasına çift tıklayın.
2.  Kurulum sihirbazı gerekli 4 modülü kuracak ve masaüstünüze parlayan mavi
    Nova Browser V54 simgesini ekleyecektir.
3.  Ekranda "Tarayıcıyı başlatmak için bir tuşa basın" uyarısı gelince Enter'a
    basın.

🍏 macOS (MacBook / iMac / Mac mini) İçin Kurulum:

1.  Proje klasöründeki setup_mac.command dosyasına çift tıklayın.
2.  Masaüstünüze bağımsız çalışan Nova Browser V54.app Apple uygulaması
    oluşturulacaktır.

🐧 Linux (Ubuntu, Debian, Fedora vb.) İçin Kurulum:

1.  Terminali açın ve proje dizininde şu komutları verin:
    chmod +x setup_linux.sh start.sh
    ./setup_linux.sh
2.  Masaüstünüze Nova Browser V54 simgesi eklenecek ve uygulama açılacaktır.

3. Tarayıcıyı Başlatma ve Çalışma Mantığı

  - Masaüstü Kısayolu: Kurulum tamamlandıktan sonra tek yapmanız gereken
    masaüstündeki mavi Nova logosuna çift tıklamaktır.
  - İzole Uygulama Modu (App Mode): Nova Browser, kişisel tarayıcınızın geçmişi
    ve eklentilerinden bağımsız, adres çubuğu karmaşası olmayan tam ekran
    masaüstü penceresi olarak açılır.
  - Arka Plan Sunucusu: Sunucu (localhost:3000) tamamen arka planda sessiz
    çalışır; ekranda rahatsız edici siyah CMD pencereleri kalmaz.

4. YouTube HD ve Engelsiz Video Motoru

  - "Video Kullanılamıyor" Hatasına Son: YouTube'un dış sitelerde engellediği
    (Error 150 / 101) videolar dahil tüm içerikler, sunucudaki Kalkan Kırıcı
    Tünel (/api/proxy/player) sayesinde kesintisiz açılır.
  - Gerçek Kanal Fotoğrafları & Doğruluk: Aramalarda ve videolarda tek harfli
    simgeler değil; kanalın YouTube'daki orijinal yüksek çözünürlüklü profil
    fotoğrafı görüntülenir.
  - Tıklanan Doğru Video Garantisi: Listede bastığınız video ne ise, doğrudan o
    video oynatıcıya yüklenir ve oynatılır.
  - Tam Ekran & HD Seçenekleri: 1080p, 720p, 480p kalite tercihleri ve sinema
    modu mevcuttur.

5. Dinamik Shorts & Reels Deneyimi

  - Sıfır Sabitlik: Sayfayı her yenilediğinizde (F5 veya YouTube logosuna
    basınca) ekrandaki 4 Shorts kartı baştan karılır; asla eski sabit kartlar
    kalmaz.
  - Shorts Arama Özelliği: Üstteki arama kutusuna "minecraft shorts", "futbol
    shorts" veya "komik shorts" yazarak sadece Shorts videolarını
    aratabilirsiniz.
  - Dikey Kaydırılabilir Oynatıcı:
      - Fare Tekerleği (Mouse Wheel): Aşağı kaydırarak sıradaki Shorts'a
        geçebilirsiniz.
      - Klavye Ok Tuşları: Klavyeden ↓ (Aşağı Ok) ile sonraki Shorts'a, ↑
        (Yukarı Ok) ile önceki Shorts'a geçebilirsiniz.
      - Ekran Butonları: Ekrandaki ▲ ve ▼ oklarıyla geçiş yapabilirsiniz.

6. Chrome Tarzı Evrensel Medya Kontrol Merkezi

  - Sağ üst köşedeki Müzik Notalı (🎵) butona tıklayarak açabilirsiniz.
  - Başka bir sekmede gezinirken, arama yaparken veya YouTube ana sayfasındayken
    bile çalan videoyu durdurabilir, devam ettirebilir ve video kapağını
    görebilirsiniz.
  - Klavyenizdeki fiziksel multimedya tuşları (Play / Pause / Next) ile de tam
    uyumludur.

7. Pencere İçinde Pencere (PiP / Mini Oynatıcı)

  - Video izlerken sağ üstteki PiP (Küçük Pencere) simgesine tıklayın.
  - Video ekranın sağ altına küçülür; siz tarayıcıda arama yapmaya veya başka
    sayfalarda gezinmeye devam ederken video arka planda oynamaya devam eder.
  - Mini oynatıcı üzerindeki Büyüt tuşuyla istediğiniz an videoyu eski boyutuna
    getirebilirsiniz.

8. Hesap Yönetimi & Profil Değiştirme

  - Hesaplar Arası Geçiş: Sağ üstteki profil fotoğrafına tıklayarak kayıtlı
    hesaplar arasında tek tıkla geçiş yapabilirsiniz.
  - Yeni Kanal Oluşturma: "Yeni Kanal Aç" sekmesinden istediğiniz isim ve
    kullanıcı adıyla anında yeni bir YouTube hesabı oluşturabilirsiniz.
  - Kalıcı Bellek: Açtığınız hesaplar ve izleme geçmişiniz tarayıcının yerel
    güvenli belleğinde saklanır.

9. API & Entegrasyon Yönetimi

Nova Browser, hem tamamen anahtarsız (API-LESS) hem de özel API anahtarlarıyla
kısıtlamasız çalışır:

  - YouTube Data API v3: Kendi anahtarınızı eklediğinizde doğrudan Google
    sunucularına bağlanır; anahtarınız yoksa yerel derin arama motorunu devreye
    sokar.
  - Google Gemini AI: Sağ menüdeki Yapay Zeka sekmesinden Gemini anahtarınızı
    bağlayarak web sayfalarını özetletebilirsiniz.
  - Evrensel Sandbox Koruması: Hatalı anahtar girilse bile arayüz kırmızı hata
    vermez; otomatik güvenli yedek tüneli açar.

10. Kısayol Tuşları ve İpuçları

| Tuş Kombinasyonu           | İşlev                                                          |
| :------------------------- | :------------------------------------------------------------- |
| **YouTube Logosuna Tıkla** | Tüm video akışını ve Shorts'ları sıfırdan rastgele karıştırır. |
| **`↓` (Aşağı Ok)**         | Shorts modundayken bir sonraki Shorts'a geçer.                 |
| **`↑` (Yukarı Ok)**        | Shorts modundayken bir önceki Shorts'a döner.                  |
| **Fare Tekerleği**         | Shorts üzerinde aşağı/yukarı kaydırarak geçiş yapar.           |
| **Space (Boşluk)**         | Çalan videoyu duraklatır / başlatır.                           |
| **F5 veya Ctrl + R**       | Sayfayı yeniler ve yeni rastgele videolar getirir.             |

11. Sıkça Sorulan Sorular ve Sorun Giderme

Soru 1: "Port 3000 zaten kullanımda" hatası alıyorum, ne yapmalıyım?

Çözüm: Yeni sihirbazlarımız bunu otomatik çözer. run_hidden_server.bat veya
terminalden start.sh çalıştırdığınızda Port 3000'deki eski süreçler otomatik
sonlandırılır.

Soru 2: Sayfayı yenilediğimde aynı videolar mı gelir?

Cevap: Hayır. Geliştirdiğimiz Fisher-Yates karıştırma algoritması sayesinde her
yenilemede karşınıza tamamen taze, farklı izlenme sayılarına ve yüklenme
saatlerine sahip videolar çıkar.

Soru 3: Bilgisayarımdan kaldırmak istersem ne yapmalıyım?

Cevap: Proje klasörünü ve masaüstündeki kısayolu silmeniz yeterlidir.
Bilgisayarınızın Windows kayıt defterinde veya sistem klasörlerinde hiçbir
kalıntı bırakmaz.

Nova Browser V54 ile engelsiz, ultra hızlı ve özgür internet deneyiminin tadını
çıkarın!
