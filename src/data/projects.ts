import measured from './covers.measured.json';

/**
 * One entry per gallery project. To add a project: append one object to `raw`.
 * `npm run covers:measure` fills width/height/dominantColor into covers.measured.json
 * by downloading each cover once. Until then the fallbacks below are used and the
 * project counts as "unmeasured" in `npm run check`.
 */

export type Category = 'Mobile app' | 'Website' | 'Dashboard';
export const categories: Category[] = ['Mobile app', 'Website', 'Dashboard'];

export interface Project {
  id: string;
  title: string;
  category: Category;
  year: string | null; // optional, not shown yet
  role: string | null; // optional, not shown yet
  image: string; // original Cloudinary URL; always served through src/lib/cloudinary.ts
  width: number;
  height: number;
  descriptor: string; // one line, drafted from what the cover shows
  alt: string;
  dominantColor: string;
  behanceUrl: string | null; // project URL on Behance; falls back to the profile
  liveUrl: string | null; // live site, only where it is known to be up
  featured: boolean;
  caseStudy: string | null;
  confirmed: boolean; // set false for a new project until its title + category are approved
  measured: boolean; // true once covers:measure has read real dimensions
  altVerified: boolean; // true once alt was written from the actual cover
}

export const BEHANCE_PROFILE = 'https://behance.net/isaacconteh';

const CLD = 'https://res.cloudinary.com/dfzgqsya9/image/upload/';

interface Raw {
  id: string;
  title: string;
  category: Category;
  descriptor: string;
  alt: string;
  file: string; // everything after /upload/
  featured?: boolean;
  caseStudy?: string;
}

const raw: Raw[] = [
  { id: 'coleen-plant', title: "Coleen's Plant Shop", category: 'Mobile app', descriptor: "Plant shopping app, from categories to cart.", alt: "Cover for Coleen's Plant Shop: five green and white phone screens showing plant categories, a shopping cart and a product page, among monstera leaves.", file: 'v1792403992/Coleen_Plant_01_twrmmd.png' },
  { id: 'jannah-interior', title: "Jannah's Interior Solutions", category: 'Website', descriptor: "Website UI/UX for an interior design studio.", alt: "Cover for Jannah's Interior Solutions: a laptop showing a website hero, 'Crafting Spaces, Enriching Lives', on a stone plinth beside dried pampas grass.", file: 'v1792403993/Jannah_Interior01_zazqgd.png' },
  { id: 'al-rayyan-clinic', title: "Al Rayyan Dental Clinic", category: 'Mobile app', descriptor: "Dental care booking app with virtual consults.", alt: "Cover for Al Rayyan Dental Clinic: three phone screens on a pale blue background showing virtual consult options and dentist profiles, headline 'Your Smile, Our Priority'.", file: 'v1792403988/ALrAYYAN_cLINIC02_xp2ohh.png' },
  { id: 'zacoustics', title: "Zacoustics Music Instruments Qatar", category: 'Website', descriptor: "Guitar shop website, shown on laptop, tablet and phone.", alt: "Cover for Zacoustics Music Instruments Qatar: a phone, laptop and tablet showing a dark guitar-shop website with the headline 'Play. Record. Belong.' over a glowing purple guitar photo.", file: 'v1792403989/zacoustic02_ls2amg.png' },
  { id: 'corporate-fitness', title: "Corporate Fitness", category: 'Mobile app', descriptor: "Fitness app UI kit with a design system.", alt: "Cover for Corporate Fitness UI Mobile Kit: dark phone screens with lime-green accents showing a news feed, an onboarding height picker and an activity summary.", file: 'v1792403990/Corporate_Fitness_01_w0ioig.png' },
  { id: 'aereus-music', title: "Aureus Music School", category: 'Website', descriptor: "Music school website with class schedule, light and dark pages.", alt: "Cover for Aureus Music School: a long landing page, a dark-theme page and a mobile view showing music classes, a weekly schedule and performers, on a dark purple background.", file: 'v1792403983/Aereus_Music_01_pfwt80.png' },
  { id: 'zaco-360', title: "Zaco 360 Tours Qatar", category: 'Website', descriptor: "Website for immersive 360° interior tours.", alt: "Cover for Zaco 360 Tours Qatar: a laptop showing a website hero, 'Bringing Spaces to Life with 360° tours', in a warm, softly lit living room.", file: 'v1792403985/zaco36001_mdb5fg.png' },
  { id: 'doha-transport', title: "Doha Transport App", category: 'Mobile app', descriptor: "Bus journey planning and ticketing app.", alt: "Cover for Doha Transport App Template: three phone screens on a light blue background showing bus route search, route results and a boarding pass, with the Doha skyline behind.", file: 'v1792403985/DohaTransport_01_avtvga.png' },
  { id: 'leone-museum', title: "Museum & Antique Shop", category: 'Mobile app', descriptor: "Museum tour and antique shop app UI kit.", alt: "Cover for the Museum & Antique Shop mobile app UI kit: phone screens showing galleries, a virtual tour and antique items, beside a marble bust.", file: 'v1792403987/Leone_Museum_02-1_vbta47.png' },
  { id: 'tahel-coo', title: "Taheel COO Dashboard", category: 'Dashboard', descriptor: "Operations dashboard with sales, productivity and team views.", alt: "Cover for the Taheel COO Dashboard: a laptop showing a sales performance chart, a productivity figure and an action centre list on a deep blue background.", file: 'v1792403987/Tahel_COO_01_riudfp.png' },
  { id: 'dee-properties', title: "Dee Properties", category: 'Mobile app', descriptor: "Real estate finder and rental app template.", alt: "Cover for Dee Properties, a real estate finder and rental mobile app template: dark phone screens showing property listings, favourites and a map view.", file: 'v1792403987/Dee_Properties_01_enmomz.png' },
  { id: 'telecom-app', title: "B2C Telecom App", category: 'Mobile app', descriptor: "Telecom self-service app: bill, offers and device deals.", alt: "Cover for a B2C telecom app landing page: two phone screens showing a current bill with quick pay, add-ons, eShop device deals and exclusive offers.", file: 'v1792407384/telecomApp_qtwln7.png' },
  { id: 'flixx-jobs', title: "Flixx Jobs", category: 'Mobile app', descriptor: "Job search app for Sierra Leone. UX case study.", alt: "Cover for Flixx Jobs, a UX case study: a red background with phone screens showing job listings, an onboarding screen for jobs in Sierra Leone, and a job description.", file: 'v1792407386/Flixx_Jobs_eigzak.png', featured: true, caseStudy: 'flixx-jobs' },
  { id: 'sierra-sell', title: "Sierra-Sell", category: 'Mobile app', descriptor: "E-commerce app for Sierra Leone. UX case study.", alt: "Cover for Sierra-Sell, a UX case study for an e-commerce store in Sierra Leone: phone screens showing a splash screen, a Samsung product page and a trending home screen.", file: 'v1792407385/Sierra_sell_hkncry.png', featured: true, caseStudy: 'sierra-sell' },
  { id: 'ai-robocare', title: "AiRoboCare", category: 'Website', descriptor: "Medical services landing page across desktop, tablet and phone.", alt: "Cover for AiRoboCare: an orange medical-services landing page shown on a desktop monitor, a tablet, a phone and a watch.", file: 'v1792404664/AI_Robocare_om04g8.png' },
  { id: 'shaos-kitchen', title: "Shao's Kitchen", category: 'Website', descriptor: "Bakery website with a menu and ordering information.", alt: "Cover for Shao's Kitchen: a bakery website with a chocolate cake hero image, shown on a desktop monitor, a tablet, a phone and a watch.", file: 'v1792404665/shao_Kitchen_pjwptr.png' },
  { id: 'hr-dashboard', title: "HR Dashboard", category: 'Dashboard', descriptor: "HR admin dashboard with staff, departments and payroll.", alt: "Cover for HR-Dashboard: tablet screens on a grey-purple background showing an HR admin dashboard, staff list, departments and a payroll generator.", file: 'v1792404662/hrdashboard_vbq7ma.png' },
  { id: 'muglina-food-app', title: "Muglina Qatar Food App", category: 'Mobile app', descriptor: "Food discovery and delivery app UI.", alt: "Cover for Muglina Qatar food delivery app: four phone screens in light and dark themes showing recipes, categories and a chicken dish, with the headline 'Food you love, delivered fast.'", file: 'v1792403988/Muglina_FoodApp_02_pd0wi9.png' },
  { id: 'whf-music', title: "WHF Music", category: 'Website', descriptor: "Music production website for a studio in Doha.", alt: "Cover for WHF Music, Doha: a music production website with a man wearing headphones in a studio, shown on a monitor, a tablet, a phone and a watch.", file: 'v1792404663/WHF_Music_ehesv8.png' },
  { id: 'wapishi-online', title: "Wapishi Online", category: 'Mobile app', descriptor: "Food supply marketplace connecting growers and retailers.", alt: "Cover for Wapishi: a food supply marketplace with a fresh groceries offer, shown as a desktop landing page, a tablet and a phone.", file: 'v1792404662/wapishiOnline_odui7v.png' },
];

const behance: Record<string, string> = {
  'flixx-jobs': 'https://www.behance.net/gallery/151212775/Flixx-Jobs-UX-Case-Study',
  'sierra-sell': 'https://www.behance.net/gallery/149887471/Sierra-Sell-Ecommerce-App-UX-Case-Study',
  'hr-dashboard': 'https://www.behance.net/gallery/148893405/HR-Dashboard',
};
const live: Record<string, string> = {
  'shaos-kitchen': 'https://kitchensh.netlify.app/',
  'wapishi-online': 'https://wapishi.online/',
};

type Measure = { width: number; height: number; dominantColor: string };
const m = measured as Record<string, Measure>;

export const projects: Project[] = raw.map((r) => {
  const hit = m[r.id];
  return {
    id: r.id,
    title: r.title,
    category: r.category,
    year: null,
    role: null,
    image: CLD + r.file,
    width: hit?.width ?? 1600,
    height: hit?.height ?? 1200,
    descriptor: r.descriptor,
    alt: r.alt,
    dominantColor: hit?.dominantColor ?? '#d8d4cb',
    behanceUrl: behance[r.id] ?? null,
    liveUrl: live[r.id] ?? null,
    featured: r.featured ?? false,
    caseStudy: r.caseStudy ?? null,
    confirmed: true, // titles and categories approved by Isaac
    measured: Boolean(hit),
    altVerified: true, // written from the actual cover
  };
});

export const byId = (id: string) => projects.find((p) => p.id === id)!;
export const featured = projects.filter((p) => p.featured);
