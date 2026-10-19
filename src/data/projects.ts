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
  year: string | null; // [ADD]
  role: string | null; // [ADD]
  image: string; // original Cloudinary URL; always served through src/lib/cloudinary.ts
  width: number;
  height: number;
  alt: string;
  dominantColor: string;
  behanceUrl: string | null; // [ADD] project URL; falls back to the profile
  featured: boolean;
  caseStudy: string | null;
  confirmed: boolean; // false until Isaac approves title + category
  measured: boolean; // true once covers:measure has read real dimensions
  altVerified: boolean; // true once alt was written from the actual cover
}

export const BEHANCE_PROFILE = 'https://behance.net/isaacconteh';

const CLD = 'https://res.cloudinary.com/dfzgqsya9/image/upload/';

interface Raw {
  id: string;
  title: string;
  category: Category;
  file: string; // everything after /upload/
  featured?: boolean;
  caseStudy?: string;
}

const raw: Raw[] = [
  { id: 'jannah-interior', title: 'Jannah Interior', category: 'Website', file: 'v1792403993/Jannah_Interior01_zazqgd.png' },
  { id: 'muglina-food-app', title: 'Muglina Food App', category: 'Mobile app', file: 'v1792403988/Muglina_FoodApp_02_pd0wi9.png' },
  { id: 'al-rayyan-clinic', title: 'Al Rayyan Clinic', category: 'Website', file: 'v1792403988/ALrAYYAN_cLINIC02_xp2ohh.png' },
  { id: 'zacoustics', title: 'Zacoustics', category: 'Website', file: 'v1792403989/zacoustic02_ls2amg.png' },
  { id: 'corporate-fitness', title: 'Corporate Fitness', category: 'Mobile app', file: 'v1792403990/Corporate_Fitness_01_w0ioig.png' },
  { id: 'coleen-plant', title: 'Coleen Plant', category: 'Website', file: 'v1792403992/Coleen_Plant_01_twrmmd.png' },
  { id: 'aereus-music', title: 'Aereus Music', category: 'Mobile app', file: 'v1792403983/Aereus_Music_01_pfwt80.png' },
  { id: 'zaco-360', title: 'Zaco 360', category: 'Website', file: 'v1792403985/zaco36001_mdb5fg.png' },
  { id: 'doha-transport', title: 'Doha Transport', category: 'Mobile app', file: 'v1792403985/DohaTransport_01_avtvga.png', featured: true, caseStudy: 'doha-transport' },
  { id: 'leone-museum', title: 'Leone Museum', category: 'Website', file: 'v1792403987/Leone_Museum_02-1_vbta47.png' },
  { id: 'tahel-coo', title: 'Tahel COO', category: 'Website', file: 'v1792403987/Tahel_COO_01_riudfp.png' },
  { id: 'dee-properties', title: 'Dee Properties', category: 'Website', file: 'v1792403987/Dee_Properties_01_enmomz.png' },
  { id: 'telecom-app', title: 'Telecom App', category: 'Mobile app', file: 'v1792404663/telecomApp_prwqmp.png' },
  { id: 'ai-robocare', title: 'AI Robocare', category: 'Mobile app', file: 'v1792404664/AI_Robocare_om04g8.png' },
  { id: 'shaos-kitchen', title: "Shao's Kitchen", category: 'Website', file: 'v1792404665/shao_Kitchen_pjwptr.png' },
  { id: 'flixx-jobs', title: 'Flixx Jobs', category: 'Mobile app', file: 'v1792404664/Flixx_Jobs_lsobg9.png', featured: true, caseStudy: 'flixx-jobs' },
  { id: 'sierra-sell', title: 'Sierra Sell', category: 'Mobile app', file: 'v1792404663/Sierra_sell_bvftqv.png' },
  { id: 'hr-dashboard', title: 'HR Dashboard', category: 'Dashboard', file: 'v1792404662/hrdashboard_vbq7ma.png', featured: true, caseStudy: 'hr-dashboard' },
  { id: 'whf-music', title: 'WHF Music', category: 'Website', file: 'v1792404663/WHF_Music_ehesv8.png' },
  { id: 'wapishi-online', title: 'Wapishi Online', category: 'Website', file: 'v1792404662/wapishiOnline_odui7v.png' },
];

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
    alt: `Cover design for ${r.title}`,
    dominantColor: hit?.dominantColor ?? '#d8d4cb',
    behanceUrl: null,
    featured: r.featured ?? false,
    caseStudy: r.caseStudy ?? null,
    confirmed: false,
    measured: Boolean(hit),
    altVerified: false,
  };
});

export const byId = (id: string) => projects.find((p) => p.id === id)!;
export const featured = projects
  .filter((p) => p.featured)
  .sort((a, b) => ['flixx-jobs', 'hr-dashboard', 'doha-transport'].indexOf(a.id) - ['flixx-jobs', 'hr-dashboard', 'doha-transport'].indexOf(b.id));
