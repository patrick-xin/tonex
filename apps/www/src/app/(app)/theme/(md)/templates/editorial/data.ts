import type { BookableSlot, Capability, Honor, Project } from './types'

export const PROJECTS: Project[] = [
  {
    id: 'marena',
    number: '01',
    title: 'MARENA',
    serifAccent: 'quarterly',
    tags: ['EDITORIAL', 'PRINT'],
    year: '25',
    category: 'editorial',
    description:
      'A highly-structured physical catalog charting high-contrast minimalist architecture in coastal Portugal. Crafted with generous margins, a custom grid system, and tactile offset paper stock.',
    client: 'Marena Arch Studio',
    medium: 'Biannual Publication, 240 pages',
    dimension: '210 × 280 mm',
    image:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'casa-oriente',
    number: '02',
    title: 'CASA',
    serifAccent: 'ORIENTE',
    tags: ['IDENTITY', 'WAYFINDING'],
    year: '25',
    category: 'branding',
    description:
      'A complete graphic taxonomy and environmental identification system for an independent arts centre in Madeira, incorporating custom brass lettering and blind-embossed stationery.',
    client: 'Casa Oriente Cultural',
    medium: 'Bespoke Wayfinding & Stationeries',
    dimension: 'Variable architectural scale',
    image:
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'new-atlas',
    number: '03',
    title: 'a NEW',
    serifAccent: 'ATLAS',
    tags: ['BOOK', 'CARTOGRAPHY'],
    year: '24',
    category: 'editorial',
    description:
      'An oversized monograph plotting abandoned military and coastal signal towers across the North Atlantic shores. Features triple-column typography and a thread-sewn open spine.',
    client: 'Atlantic Archive Trust',
    medium: 'Hardcover Book, hand-bound linen',
    dimension: '240 × 330 mm',
    image:
      'https://images.unsplash.com/photo-1580136579312-94651dfd596d?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'frida-soap',
    number: '04',
    title: 'FRIDA',
    serifAccent: 'SOAP CO.',
    tags: ['BRANDING', 'PACKAGING'],
    year: '24',
    category: 'branding',
    description:
      'Packaging systems utilizing raw, unbleached cotton paper wraps, hand-applied wax stamps, and debossed organic typographic glyphs representing the soap formulas.',
    client: 'Frida Apothecary',
    medium: 'Fibre wraps & primary brand system',
    dimension: '70 × 110 mm boxed series',
    image:
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'palacio-eco',
    number: '05',
    title: 'PALACIO',
    serifAccent: 'de ECO',
    tags: ['WEB', 'MUSEUM'],
    year: '24',
    category: 'digital',
    description:
      'A dynamic digital sound archive for the acoustic galleries of the Seville Sound Museum. Implements slow micro-interaction sweeps, custom audio playback, and fluid typographic transitions.',
    client: 'Seville Museum of Science & Sound',
    medium: 'Interactive Digital Platform & Audio Engine',
    dimension: 'Responsive viewport matrix',
    image:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'soft-kiln',
    number: '06',
    title: 'SOFT',
    serifAccent: 'KILN journal',
    tags: ['TYPE', 'EDITORIAL'],
    year: '23',
    category: 'type',
    description:
      'An independent print journal capturing the historical brick kilns, clay pits, and wood-firing studios of Spain. Set in a custom, low-descender serif font.',
    client: 'Kiln & Fire Collective',
    medium: 'Softcover journal, 160 pages',
    dimension: '148 × 210 mm',
    image:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'artefacta',
    number: '07',
    title: 'ARTEFACTA',
    serifAccent: 'bienal',
    tags: ['TYPE', 'IDENTITY'],
    year: '23',
    category: 'type',
    description:
      'Bespoke incised display typography designed for the Lisbon Antiquities festival, drawing heavily on classic limestone carving angles.',
    client: 'Municipality of Lisbon',
    medium: 'Digital Type Family / Event Identity',
    dimension: 'Unified OTF suite',
    image:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'soil-stone',
    number: '08',
    title: 'SOIL &',
    serifAccent: 'STONE',
    tags: ['BRANDING', 'STATIONERY'],
    year: '22',
    category: 'branding',
    description:
      'A premium sensory stationery suite for an architectural restoration cooperative. Standard items use charcoal-pigmented cardstock and matte grey copper foils.',
    client: 'Soil & Stone restoration',
    medium: 'Stationery Suite & Brand Architecture',
    dimension: 'Standard DIN range',
    image:
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=600&auto=format&fit=crop',
  },
]

export const CAPABILITIES: Capability[] = [
  {
    id: 1,
    number: '1/5',
    title: 'BRANDING',
    serfWord: 'IDENTITY',
    description:
      'A foundational visual system — logo, wordmark, palette, type, motion, voice — handset for studios that want to feel like a organic printed object, not a generic wireframe.',
    details: [
      'Brand Positioning & Aesthetic Anchoring',
      'Bespoke Monograms & Custom Logos',
      'Typography Guidelines & System Alignment',
      'Stationery & Digital Assets Matrix',
    ],
  },
  {
    id: 2,
    number: '2/5',
    title: 'EDITORIAL',
    serfWord: 'PRINT',
    description:
      'Our historic core. We craft books exhibition broadsheets with extreme grid discipline, selecting materials, and binding method with tactile longevity in mind. Each piece is designed as a lasting record of cultural memory.',
    details: [
      'Book Design, Layout & Art Direction',
      'Independent Catalogues & Monographs',
      'Paper Stock & Binding Consultations',
      'Grid Architecture & Typography Scale',
    ],
  },
  {
    id: 3,
    number: '3/5',
    title: 'WEBSITES',
    serfWord: 'MICROSITES',
    description:
      'The browser is a sheet of glass. We build high-density, lightning-fast digital spaces that reject intrusive scroll effects in favor of typographical rhythm and layout honesty.',
    details: [
      'Custom Typography UI Architectures',
      'Portfolio Showcases & Gallery Archives',
      'Clean CSS Layouts & Spatial Negative Space',
      'Responsive Fluid Grid Frameworks',
    ],
  },
  {
    id: 4,
    number: '4/5',
    title: 'CUSTOM',
    serfWord: 'DISPLAY TYPE',
    description:
      'When a project calls for an absolute structural signature, we carve tailored display typography families and wordmarks from historical limestone cuts or modernist geometries.',
    details: [
      'Bespoke Editorial Serif Families',
      'Bespoke Geometric Sans Display Type',
      'Custom Ligatures & Special Glyphs',
      'Web Fonts Layout Optimization',
    ],
  },
  {
    id: 5,
    number: '5/5',
    title: 'ART',
    serfWord: 'DIRECTION',
    description:
      'We orchestrate low-key product captures, monochromatic work landscapes, and editorial designed specifically to align with our typography grids and spacing rules.',
    details: [
      'Location Photography & Layout Framing',
      'Mono Corporate Identity Workscapes',
      'Product Packaging Debossing Captures',
      'Sensory Styleguide Collateral Guides',
    ],
  },
]

export const HONORS: Honor[] = [
  { id: 'h1', award: 'D&AD', category: 'wood pencil', year: '25' },
  { id: 'h2', award: 'TDC', category: 'type design selection', year: '25' },
  { id: 'h3', award: 'BRAND NEW awards', category: 'noted identity selection', year: '24' },
  { id: 'h4', award: 'ADC', category: 'silver cube for packaging', year: '24' },
  { id: 'h5', award: "IT'S NICE THAT", category: 'annual feature highlight', year: '23' },
]

export const BOOKING_SLOTS: BookableSlot[] = [
  { id: 's1', day: 'MON', time: '11:00 - 11:30', available: true },
  { id: 's2', day: 'MON', time: '14:00 - 14:30', available: false },
  { id: 's3', day: 'TUE', time: '10:30 - 11:00', available: true },
  { id: 's4', day: 'TUE', time: '15:00 - 15:30', available: true },
  { id: 's5', day: 'WED', time: '14:00 - 14:30', available: true },
  { id: 's6', day: 'THU', time: '11:00 - 11:30', available: false },
  { id: 's7', day: 'THU', time: '16:00 - 16:30', available: true },
]
