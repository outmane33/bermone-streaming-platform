"use client";

export function detectExtensions(onDetected) {
  const commonExtensions = [
    // ============================================
    // VIDEO DOWNLOADERS (High Priority)
    // ============================================
    "chrome-extension://nlipoenfbbikpbjkfpfillcgkoblgpmj", // Video DownloadHelper
    "chrome-extension://llkgjffcdpffmhiakmfcdcblohccpfmo", // Flash Video Downloader
    "chrome-extension://mcjhfgfbaadepegbhgnjieajbamnmbcl", // IDM Integration
    "chrome-extension://jfiihjeimjpkpoaekpdpllpaeichkiod", // Video Downloader professional
    "chrome-extension://gfjopfpjmkcfgjpogepmdjmcnihfpokn", // Video Downloader Plus
    "chrome-extension://fmkadmapgofadopljbjfkapdkoienihi", // FVD Video Downloader
    "chrome-extension://bpjgmmlhebpgbdpkcjmadmofhfbpoima", // Video Downloader GetThemAll
    "chrome-extension://djdcinealgfkemllfpfnfkmfnlbgjaob", // Vimeo Video Downloader
    "chrome-extension://fhplmmllnpjjlncfjpbbpjadoeijkogc", // Video2Edit
    "chrome-extension://kpkbnefaikfaeadgidhpoanckoiaheli", // SaveFrom.net Helper
    "chrome-extension://cocopjnpmnaancfjjkfenkhgfjljiodc", // Stream Video Downloader
    "chrome-extension://cgpbghdbejagejmciefmekcklikpoeel", // Ant Video Downloader

    // ============================================
    // SCREEN RECORDERS & CAPTURE
    // ============================================
    "chrome-extension://bnomihfieiccainjcjblhegjgglakjdd", // Nimbus Screenshot
    "chrome-extension://mmeijimgabbpbgpdklnllpncmdofkcpn", // Awesome Screenshot
    "chrome-extension://nlipoenfbbikpbjkfpfillcgkoblgpmj", // FireShot
    "chrome-extension://hihmmldggddepbdajfmfcfonhdelphgh", // Loom
    "chrome-extension://iahnhfdhidomcpggpaimmmahffihkfnj", // Nimbus Capture
    "chrome-extension://nhjmmiojakkmhjmmgfemdeaoinccibea", // Screencastify
    "chrome-extension://ejfmffkmeigkphomnpabpdabfddeadcb", // Screen Recorder

    // ============================================
    // DEVELOPER TOOLS
    // ============================================
    "chrome-extension://fmkadmapgofadopljbjfkapdkoienihi", // React DevTools
    "chrome-extension://lmhkpmbekcpmknklioeibfkpmmfibljd", // Redux DevTools
    "chrome-extension://bfbameneiokkgbdmiekhjnmfkcnldhhm", // Web Developer
    "chrome-extension://bhlhnicpbhignbdhedgjhgdocnmhomnp", // ColorZilla
    "chrome-extension://ogffaloegjglncjfehdfplabnoondfjo", // Wappalyzer
    "chrome-extension://gppongmhjkpfnbhagpmjfkannfbllamg", // Wappalyzer (alternate)
    "chrome-extension://ljdobmomdgdljniojadhoplhkpialdid", // Page Ruler Redux
    "chrome-extension://hgmloofddffdnphfgcellkdfbfbjeloo", // WhatFont
    "chrome-extension://hdokiejnpimakedhajhdlcegeplioahd", // SEO META in 1 CLICK

    // ============================================
    // NETWORK INSPECTORS & PROXIES
    // ============================================
    "chrome-extension://cjpalhdlnbpafiamejdnhcphjbkeiagm", // uBlock Origin
    "chrome-extension://cfhdojbkjhnklbpkdaibdccddilifddb", // Adblock Plus
    "chrome-extension://gighmmpiobklfepjocnamgkkbiglidom", // AdBlock
    "chrome-extension://oocalimimngaihdkbihfgmpkcpnmlaoa", // Requestly
    "chrome-extension://dgkplhmnjiabnikcbkgndhlogjiebjcb", // Charles Proxy
    "chrome-extension://mnjggcdmjocbbbhaepdhchncahnbgone", // Fiddler Everywhere
    "chrome-extension://aejoelaoggembcahagimdiliamlcdmfm", // HTTP/2 and SPDY indicator
    "chrome-extension://ljknpmjgojcljofmjogfblblijmfcoim", // HTTP Spy
    "chrome-extension://ajhifddimkapgcifgcodmmfdlknahffk", // Proxy SwitchyOmega
    "chrome-extension://gcknhkkoolaabfmlnjonogaaifnjlfnp", // FoxyProxy

    // ============================================
    // REQUEST INTERCEPTORS & MODIFIERS
    // ============================================
    "chrome-extension://fjoijdanhaiflhibkljeklgbhcdagacb", // Postman Interceptor
    "chrome-extension://fdmmgilgnpjigdojojpjoooidkmcomcm", // Web Scraper
    "chrome-extension://ehkepjiconegkhpodgoaeamnpckdbblp", // ModHeader
    "chrome-extension://nfgdhgfpgjmiopajdjokalenlimnkgcp", // Header Editor
    "chrome-extension://amknoiejhlmhancpahfcfcfhllgkpbld", // Simple Allow Copy
    "chrome-extension://jkompbllimaoekaogchhkmkdogpkhojg", // User-Agent Switcher

    // ============================================
    // COOKIE & STORAGE MANAGERS
    // ============================================
    "chrome-extension://fngmhnnpilhplaeedifhccceomclgfbg", // EditThisCookie
    "chrome-extension://jfopckpbdmkdeojhnmjkohgoohcahaga", // Cookie Editor
    "chrome-extension://lpjgfbgfbfbhnjijgjpajhckfhbekblk", // Cookie Manager

    // ============================================
    // JAVASCRIPT DEBUGGERS & INJECTORS
    // ============================================
    "chrome-extension://dhdgffkkebhmkfjojejmpbldmpobfkfo", // Tampermonkey
    "chrome-extension://gcalenpjmijncebpfijmoaglllgpjagf", // Tampermonkey (alternate)
    "chrome-extension://jinjaccalgkegednnccohejagnlnfdag", // Violentmonkey
    "chrome-extension://cjfbmleiaobegagekpmlhmaadepdeedn", // Greasemonkey
    "chrome-extension://iikmkjmpaadaobahmlepeloendndfphd", // Code Injector
    "chrome-extension://dhdgffkkebhmkfjojejmpbldmpobfkfo", // User JavaScript and CSS

    // ============================================
    // DOWNLOAD MANAGERS
    // ============================================
    "chrome-extension://gfjopfpjmkcfgjpogepmdjmcnihfpokn", // Chrono Download Manager
    "chrome-extension://lgllffgicojgllpmdbemgglaponefajn", // DownThemAll
    "chrome-extension://mcnjcljclhgbfbgaagjbdgeihkbphlkf", // Free Download Manager
    "chrome-extension://lfpjkncokllnfokkgpkobnkbkmelfefj", // Turbo Download Manager

    // ============================================
    // STREAMING & M3U8 DOWNLOADERS
    // ============================================
    "chrome-extension://ccdikaeocgqeacfnjfgdnoekalhhfgke", // Stream Recorder
    "chrome-extension://dofpdnfjkfadlgbjlilcfbpopkdbfegd", // HLS Downloader
    "chrome-extension://lhoakaggloagbjpfgjhhoglpkbhgonkg", // M3U8 Downloader
    "chrome-extension://dmbfkdilpijjbhbgfnkdbnlkfdhfjfik", // Online Video Downloader

    // ============================================
    // AUTOMATION & TESTING TOOLS
    // ============================================
    "chrome-extension://fdpohaocaechififmbbbbbknoalclacl", // Selenium IDE
    "chrome-extension://abaigifkjfjbdgdmiifbmdbpjbknnodc", // Katalon Recorder
    "chrome-extension://ofjgnhihlklpobkaloamkankaaoclfjh", // Ghost Inspector
    "chrome-extension://hmkidjfhfgeakgjkmecakkofhpghfhel", // Puppeteer Recorder

    // ============================================
    // PRIVACY & SECURITY TOOLS (that can inspect)
    // ============================================
    "chrome-extension://cfhdojbkjhnklbpkdaibdccddilifddb", // Ghostery
    "chrome-extension://mlomiejdfkolichcflejclcbmpeaniij", // HTTPS Everywhere
    "chrome-extension://gcbommkclmclpchllfjekcdonpmejbdp", // HTTPS Everywhere (alternate)
    "chrome-extension://pkehgijcmpdhfbdbbnkijodmdjhbjlgp", // Privacy Badger

    // ============================================
    // MISC INSPECTION TOOLS
    // ============================================
    "chrome-extension://hgimnogjllphhhkhlmebbmlgjoejdpjl", // JSON Viewer
    "chrome-extension://chklaanhfefbnpoihckbnefhakgolnmc", // JSON Formatter
    "chrome-extension://bcjindcccaagfpapjjmafapmmgkkhgoa", // JSON Viewer Pro
    "chrome-extension://nkibblcdlfkmicdmjocjdoggclldpfaa", // Octotree
    "chrome-extension://pnnfemgpilpdaojpnkjdgfgbnnjojfik", // Check My Links
    "chrome-extension://oldceeleldhonbafppcapldpdifcinji", // Grammar & Spell Checker (can inspect)

    // ============================================
    // FIREFOX EXTENSIONS (for completeness)
    // ============================================
    "moz-extension://", // General Firefox extension pattern
  ];

  let detected = [];

  commonExtensions.forEach((ext) => {
    const img = new Image();
    img.src = `${ext}/icon.png`;

    img.onload = () => {
      if (!detected.includes(ext)) {
        detected.push(ext);
        onDetected?.(ext);
      }
    };
  });

  return detected;
}

export function setupExtensionDetection(router, onDetected) {
  const handleExtensionDetected = (ext) => {
    console.clear();
    onDetected?.();
    router.push("/");
  };

  // Run detection on mount
  detectExtensions(handleExtensionDetected);

  // Periodic checks every 10 seconds
  const interval = setInterval(() => {
    detectExtensions(handleExtensionDetected);
  }, 10000);

  return () => clearInterval(interval);
}
