// ============================================
// ICONS
// ============================================
import {
  Clapperboard,
  Tv,
  Eye,
  Heart,
  FolderDown,
  Clock,
  Earth,
  Languages,
  CalendarClock,
  TvMinimalPlay,
  AlignStartVertical,
  TvMinimal,
  CalendarSync,
  Popcorn,
  Wallpaper,
  Facebook,
  Twitter,
  Send,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  CheckCircle,
  Film,
  Server,
  Download,
  Loader2,
  Lock,
  Shield,
  ChevronDown,
  X,
  Search,
  MonitorPause,
  Play,
  Star,
  Calendar,
  Menu,
  CalendarFold,
  Folders,
  ArrowDownToLine,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

// ============================================
// ICONS MAPPING
// ============================================
export const ICON_MAP = {
  Eye,
  Heart,
  FolderDown,
  Clock,
  TvMinimal,
  CalendarSync,
  Popcorn,
  Wallpaper,
  AlignStartVertical,
  TvMinimalPlay,
  CalendarClock,
  Languages,
  Earth,
  CheckCircle,
  Film,
  Server,
  Download,
  Loader2,
  Lock,
  Shield,
  ChevronDown,
  X,
  Search,
  MonitorPause,
  Play,
  Star,
  Calendar,
  Menu,
  CalendarFold,
  Clapperboard,
  Folders,
  ArrowDownToLine,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
};

// ============================================
// DESIGN SYSTEM
// ============================================
export const DESIGN_TOKENS = {
  gradients: {
    purple: "from-purple-600 to-pink-600",
    green: "from-green-600 to-emerald-600",
    orange: "from-orange-600 to-red-600",
    rose: "from-rose-600 to-pink-600",
    violet: "from-violet-600 to-purple-600",
    cyan: "from-cyan-600 to-blue-600",
    blue: "from-blue-600 to-blue-500",
    sky: "from-sky-500 to-blue-400",
    pink: "from-pink-600 to-purple-600",
    cyanLight: "from-cyan-500 to-blue-500",
  },

  glass: {
    light:
      "bg-white/15 backdrop-blur-lg backdrop-saturate-150 border border-white/30",
    medium: "bg-white/10 backdrop-blur-xl border border-white/40",
    hover: "hover:bg-white/20 hover:border-white/40",
  },

  effects: {
    hoverScale: "transition-all duration-300 hover:scale-105",
    hoverLift: "hover:scale-110 hover:-translate-y-0.5",
    transition: "transition-all duration-300",
  },
  grid: {
    container:
      "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-4 md:gap-5 px-2",
  },
};

// ============================================
// COMPONENT STYLES
// ============================================
export const COMPONENT_STYLES = {
  button: {
    base: "group relative px-3 lg:px-6 py-2 lg:py-2.5 font-semibold overflow-hidden rounded-lg transition-all duration-300 hover:scale-105 cursor-pointer",
    variants: {
      primary: `bg-gradient-to-r ${DESIGN_TOKENS.gradients.cyan} hover:shadow-2xl hover:shadow-cyan-500/50`,
      secondary: `${DESIGN_TOKENS.glass.light} border-2 border-white/20 ${DESIGN_TOKENS.glass.hover}`,
    },
  },

  badge: {
    base: "px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-bold rounded-full shadow-lg",
    variants: {
      new: "bg-red-600 text-white",
      year: "bg-yellow-600/20 text-yellow-400 border border-yellow-500/30",
      default: "bg-white/10 text-white border border-white/20",
    },
  },

  card: {
    width:
      "flex-none w-[calc(50%-8px)] sm:w-[calc(50%-12px)] md:w-[calc(35%-18px)] lg:w-[calc(25%-19.2px)] xl:w-[calc(16.666%-20px)]",
  },

  scrollButton: {
    base: "absolute top-1/2 -translate-y-1/2 z-10 text-white p-4 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 cursor-pointer backdrop-blur-lg backdrop-saturate-150",
    left: {
      position: "left-2",
      gradient: "bg-white/15 hover:bg-white/25 border-2 border-white/30",
      shadow: "shadow-2xl shadow-black/30",
      icon: ChevronLeft,
    },
    right: {
      position: "right-2",
      gradient: "bg-white/15 hover:bg-white/25 border-2 border-white/30",
      shadow: "shadow-2xl shadow-black/30",
      icon: ChevronRight,
    },
  },

  metaInfo: {
    base: "flex items-center gap-0.5 sm:gap-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border border-white/20",
    icon: "sm:w-3 sm:h-3",
  },

  iconButton: {
    base: "group relative p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-300",
    enabled: "hover:scale-110 hover:-translate-y-0.5 cursor-pointer",
    disabled: "opacity-40 cursor-not-allowed",
    inner:
      "relative bg-white/10 backdrop-blur-md border border-white/20 rounded-lg sm:rounded-xl p-1.5 sm:p-2",
    iconSize: "w-4 h-4 sm:w-5 sm:h-5 text-white",
  },
};

// ============================================
// CONFIGURATION
// ============================================
export const CONFIG = {
  scroll: {
    percentage: 0.8,
    threshold: 10,
  },
};

export const getIcon = (iconName) => ICON_MAP[iconName];

// ============================================
// NAVIGATION DATA
// ============================================
export const CATEGORIES = [
  {
    id: "home",
    icon: Clapperboard,
    label: "الرئيسية",
    href: "/?sort=latest-added",
    gradient: "from-amber-500 via-orange-500 to-yellow-500",
  },

  {
    id: "movies",
    icon: Clapperboard,
    label: "الافلام",
    gradient: "from-blue-500 to-cyan-500",
    subMenu: [
      { label: "جميع الأفلام", path: "/films" },
      { label: "افلام اجنبي", path: "/category/films?sort=foreignMovies" },
      { label: "افلام اسيوي", path: "/category/films?sort=asianMovies" },
      { label: "سلاسل الافلام", path: "/category/films?sort=movieSeries" },
      { label: "افلام انمي", path: "/category/films?sort=animeMovies" },
    ],
  },
  {
    id: "series",
    icon: Tv,
    label: "المسلسلات",
    gradient: "from-green-500 to-emerald-500",
    subMenu: [
      { label: "جميع المسلسلات", path: "/series" },
      { label: "مسلسلات اجنبي", path: "/category/series?sort=foreignSeries" },
      { label: "مسلسلات اسيوية", path: "/category/series?sort=asianSeries" },
      {
        label: "المسلسلات الاعلي تقييما",
        path: "/category/series?sort=topSeries",
      },
      {
        label: "احدث حلقات الانمي",
        path: "/category/series?sort=latestAnimeEpisodes",
      },
      { label: "قائمة الانميات", path: "/category/series?sort=animeSeries" },
    ],
  },
];

// ============================================
// SORT & FILTER OPTIONS
// ============================================
export const SORT_OPTIONS = {
  films: [
    {
      id: "popular",
      label: "الاكثر شهرة",
      icon: "Eye",
      gradient: "from-blue-500 via-cyan-500 to-teal-500",
    },
    {
      id: "best",
      label: "أفضل الافلام",
      icon: "Heart",
      gradient: "from-pink-500 via-red-500 to-rose-500",
    },
    {
      id: "old",
      label: "افلام قديمة",
      icon: "FolderDown",
      gradient: "from-amber-500 via-orange-500 to-yellow-500",
    },
    {
      id: "new",
      label: "افلام جديدة",
      icon: "Clock",
      gradient: "from-purple-500 via-violet-500 to-indigo-500",
    },
  ],

  series: [
    {
      id: "popular",
      label: "الاكثر شهرة",
      icon: "Eye",
      gradient: "from-blue-500 via-cyan-500 to-teal-500",
    },
    {
      id: "best",
      label: "أفضل المسلسلات",
      icon: "Heart",
      gradient: "from-pink-500 via-red-500 to-rose-500",
    },
    {
      id: "new",
      label: "مسلسلات جديدة",
      icon: "Clock",
      gradient: "from-purple-500 via-violet-500 to-indigo-500",
    },
    {
      id: "latest",
      label: "آخر الحلقات",
      icon: "FolderDown",
      gradient: "from-amber-500 via-orange-500 to-yellow-500",
    },
  ],

  home: [
    {
      id: "new-series",
      label: "مسلسلات جديدة",
      icon: "FolderDown",
      gradient: "from-blue-500 via-cyan-500 to-teal-500",
    },
    {
      id: "new-movies",
      label: "افلام جديدة",
      icon: "TvMinimal",
      gradient: "from-pink-500 via-red-500 to-rose-500",
    },
    {
      id: "latest-episodes",
      label: "آخر الحلقات",
      icon: "CalendarSync",
      gradient: "from-amber-500 via-orange-500 to-yellow-500",
    },
    {
      id: "latest-added",
      label: "الجديد المضاف",
      icon: "CalendarSync",
      gradient: "from-purple-500 via-violet-500 to-indigo-500",
    },
  ],
};

export const FILTER_CONFIG = {
  genre: {
    label: "النوع",
    icon: AlignStartVertical,
    gradient: "from-pink-500 via-red-500 to-yellow-500",
    options: [
      "اثارة",
      "اكشن",
      "تاريخي",
      "جريمة",
      "حربي",
      "خيال علمي",
      "دراما",
      "Reality-TV",
      "رعب",
      "رومانسي",
      "رياضي",
      "سيرة ذاتية",
      "عائلي",
      "غموض",
      "فانتازيا",
      "قصير",
      "كرتون",
      "كوميدي",
      "مغامرة",
      "موسيقي",
      "وثائقي",
      "ويسترن",
    ],
  },

  year: {
    label: "سنة الإصدار",
    icon: CalendarClock,
    gradient: "from-green-500 via-teal-500 to-cyan-500",
    options: [
      "1974",
      "1979",
      "1984",
      "1989",
      "1990",
      "1991",
      "1992",
      "1993",
      "1994",
      "1995",
      "1996",
      "1997",
      "1998",
      "1999",
      "2000",
      "2001",
      "2002",
      "2003",
      "2004",
      "2005",
      "2006",
      "2007",
      "2008",
      "2009",
      "2010",
      "2011",
      "2012",
      "2013",
      "2014",
      "2015",
      "2016",
      "2017",
      "2018",
      "2019",
      "2020",
      "2021",
      "2022",
      "2023",
      "2024",
      "2025",
    ],
  },
  language: {
    label: "اللغة",
    icon: Languages,
    gradient: "from-purple-500 via-pink-500 to-red-500",
    options: [
      "الأستونية",
      "الألمانية",
      "الأنجليزية",
      "الأوكرانية",
      "الإسبانية",
      "الإندونيسية",
      "الإيسلندية",
      "الإيطالية",
      "البرتغالية",
      "البلغارية",
      "البولونية",
      "التايلندية",
      "التركية",
      "التشيكية",
      "التغالوغ",
      "الدنماركية",
      "الروسية",
      "الرومانية",
      "الزولو",
      "السلوفاكية",
      "السويدية",
      "الصربية",
      "الصينية",
      "العبرية",
      "العربية",
      "الفارسية",
      "الفرنسية",
      "الفلبين",
      "الفنلندية",
      "الفيتنامية",
      "الكانتونية",
      "الكرواتية",
      "الكورية",
      "اللاتينية",
      "المجرية",
      "الملاوية",
      "النرويجية",
      "الهندية",
      "الهولندية",
      "الويلزية",
      "اليابانية",
      "اليونانية",
    ],
  },
  country: {
    label: "الدولة",
    icon: Earth,
    gradient: "from-yellow-500 via-orange-500 to-red-500",
    options: [
      "Korea",
      "آيسلندا",
      "أرمينيا",
      "أستراليا",
      "ألمانيا",
      "أندونيسيا",
      "أوكرانيا",
      "إسبانيا",
      "إسرائيل",
      "إيران",
      "إيطاليا",
      "الفلبين",
      "استونيا",
      "الأرجنتين",
      "الإمارات العربية المتحده",
      "البحرين",
      "البرازيل",
      "البرتغال",
      "الجمهورية التشيكية",
      "الدانمارك",
      "السويد",
      "الصين",
      "الفليبين",
      "المجر",
      "المغرب",
      "المكسيك",
      "المملكة المتحدة",
      "النرويج",
      "النمسا",
      "النيجر",
      "الهند",
      "الولايات المتحدة الامريكية",
      "اليابان",
      "اليونان",
      "باراغواي",
      "باكستان",
      "بلجيكا",
      "بلغاريا",
      "بولندا",
      "بيرو",
      "تايلندا",
      "تايوان",
      "تركيا",
      "تشيلي",
      "جمهورية أيرلندا",
      "جمهورية صربيا",
      "جمهورية الدومينيكا",
      "جنوب أفريقيا",
      "روسيا",
      "رومانيا",
      "سانت كيتس كيتس",
      "سلوفاكيا",
      "سويسرا",
      "فرنسا",
      "فنلندا",
      "فيتنام",
      "كرواتيا",
      "كندا",
      "كوريا الجنوبية",
      "كولومبيا",
      "لبنان",
      "لوكسمبورغ",
      "مالطا",
      "ماليزيا",
      "نيوزيلندا",
      "هولندا",
      "هونغ كونغ",
    ],
  },
};

// ============================================
// SOCIAL MEDIA
// ============================================
export const SOCIAL_LINKS = [
  {
    name: "Facebook",
    icon: Facebook,
    gradient: DESIGN_TOKENS.gradients.blue,
    ariaLabel: "شارك على فيسبوك",
  },
  { name: "Twitter", icon: Twitter, gradient: DESIGN_TOKENS.gradients.sky },
  {
    name: "Telegram",
    icon: Send,
    gradient: DESIGN_TOKENS.gradients.cyanLight,
    ariaLabel: "شارك على تيليجرام",
  },
  {
    name: "Whatsapp",
    icon: MessageCircle,
    gradient: DESIGN_TOKENS.gradients.cyanLight,
    ariaLabel: "شارك على واتساب",
  },
];

// ============================================
// UTILITY FUNCTIONS
// ============================================
export const getTextClasses = (isActive, hoverColor = "text-white") =>
  `transition-colors duration-300 ${
    isActive ? "text-white" : `text-white group-hover:${hoverColor}`
  }`;

export const getIconClasses = (isActive) =>
  `transition-colors duration-300 ${
    isActive ? "text-white" : "text-gray-400 group-hover:text-white"
  }`;

// ============================================
// QUERY PARAMS
// ============================================
export const VALID_QUERY_PARAMS = [
  "sort",
  "page",
  "genre",
  "quality",
  "year",
  "language",
  "country",
];

// ============================================
// DEPRECATED (For backward compatibility)
// ============================================
export const categories = CATEGORIES;
export const sortOptions = SORT_OPTIONS.films;
export const filterOptions = Object.fromEntries(
  Object.entries(FILTER_CONFIG).map(([key, val]) => [key, val.options])
);
export const filterLabels = Object.fromEntries(
  Object.entries(FILTER_CONFIG).map(([key, val]) => [key, val.label])
);
export const filterIcons = Object.fromEntries(
  Object.entries(FILTER_CONFIG).map(([key, val]) => [key, val.icon])
);
export const filterGradients = Object.fromEntries(
  Object.entries(FILTER_CONFIG).map(([key, val]) => [key, val.gradient])
);
export const socials = SOCIAL_LINKS;
export const GRADIENTS = DESIGN_TOKENS.gradients;
export const GLASS_STYLES = DESIGN_TOKENS.glass;
export const STYLES = COMPONENT_STYLES;
