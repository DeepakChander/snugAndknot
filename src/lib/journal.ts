/**
 * Journal articles. Editorial and educational — no invented interviews, statistics or
 * claims about suppliers.
 */
export interface JournalPost {
  slug: string
  tag: string
  title: string
  description: string
  image: string
  readTime: string
  date: string
  body: { type: 'p' | 'h' | 'quote'; text: string }[]
}

export const JOURNAL: JournalPost[] = [
  {
    slug: 'organic-cotton-journey',
    tag: 'Fibre',
    title: 'Where cotton learns tension',
    description: 'Why the length of a cotton fibre decides how a knit feels, pills and ages — and what to look for on a label.',
    image: '/images/blog/organic-cotton.png',
    readTime: '6 min read',
    date: '2026-09-14',
    body: [
      { type: 'p', text: 'Cotton arrives at a spinner as a soft cloud of fibres, each one a single plant cell. How long those cells are — the staple length — quietly decides almost everything about the yarn that follows.' },
      { type: 'h', text: 'Long fibres, fewer loose ends' },
      { type: 'p', text: 'Longer staples can be twisted together with fewer fibre ends poking out of the yarn. Fewer ends means a smoother surface, a little natural sheen and less pilling, because there is less loose fibre to roll into little balls with wear.' },
      { type: 'p', text: 'Shorter staples need more twist to hold together, which can make a yarn feel firmer and duller. Neither is wrong — but for knitwear that sits against the skin, length is worth paying attention to.' },
      { type: 'quote', text: 'A good yarn is mostly decided before it is ever spun.' },
      { type: 'h', text: 'Blends that earn their place' },
      { type: 'p', text: 'A touch of silk adds drape and a soft lustre; cashmere adds warmth and a halo of softness; merino brings bounce and temperature control. We blend only when the second fibre changes how a piece wears, never to hit a price.' },
      { type: 'h', text: 'Reading the label' },
      { type: 'p', text: 'Look for the fibre names and their percentages, then the care line. A knit that asks for a cold, gentle wash and flat drying is telling you it was made to be kept — follow it and the piece will reward you for years.' },
    ],
  },
  {
    slug: 'behind-the-knit',
    tag: 'Craft',
    title: 'How to read a knit',
    description: 'Rib, cable, jersey, gauge — a short field guide to the stitches and terms on our product pages.',
    image: '/images/blog/behind-knit.png',
    readTime: '7 min read',
    date: '2026-08-30',
    body: [
      { type: 'p', text: 'Every knit is built from one simple loop pulled through another. What changes from piece to piece is how those loops are arranged — and that arrangement is what you feel when you put a sweater on.' },
      { type: 'h', text: 'Jersey' },
      { type: 'p', text: 'Smooth V-shaped columns on the front, little bumps on the back. Jersey is light and drapes well, which is why our fine-gauge knit tees use it.' },
      { type: 'h', text: 'Rib' },
      { type: 'p', text: 'Alternating columns of knit and purl. Rib stretches and springs back, so it holds cuffs, hems and necklines close to the body without squeezing.' },
      { type: 'h', text: 'Cable' },
      { type: 'p', text: 'Groups of stitches crossed over their neighbours to make rope-like twists. Cables add depth and warmth — the extra yarn traps air — and are the signature of heritage knitwear like our ivory cardigan.' },
      { type: 'quote', text: 'You can feel the construction of a knit long before you can name it.' },
      { type: 'h', text: 'Gauge' },
      { type: 'p', text: 'Gauge describes how many stitches fit into a given width. A fine gauge gives a smooth, lightweight fabric; a chunky gauge gives texture and loft. It is the single best clue to how warm and how dressy a piece will be.' },
    ],
  },
  {
    slug: 'timeless-wardrobe',
    tag: 'Philosophy',
    title: 'Against the overflowing wardrobe',
    description: 'A case for fewer, better pieces — and a practical way to choose them.',
    image: '/images/blog/wardrobe-essentials.png',
    readTime: '4 min read',
    date: '2026-08-02',
    body: [
      { type: 'p', text: 'Most of us wear a small fraction of what we own. The rest waits — bought for an occasion, a mood or a sale — while a handful of favourites do the real work.' },
      { type: 'h', text: 'Start with what you reach for' },
      { type: 'p', text: 'Look at the pieces you wear most. What do they share? Often it is the fabric and the fit rather than the style: a neckline that sits right, a knit that does not itch, a colour that goes with everything else.' },
      { type: 'h', text: 'Buy for the tenth wear, not the first' },
      { type: 'p', text: 'A piece reveals its quality slowly — after washing, after a season, after it has been folded and unfolded fifty times. Natural fibres, careful seams and good buttons are what make the tenth wear feel as good as the first.' },
      { type: 'quote', text: 'Fewer pieces, chosen well, are a kind of freedom.' },
      { type: 'p', text: 'We design in small numbers for exactly this reason. Not a hundred styles a season — a short list of knits we would want to wear for years.' },
    ],
  },
]

export function getJournalPost(slug: string) {
  return JOURNAL.find((p) => p.slug === slug) ?? null
}
