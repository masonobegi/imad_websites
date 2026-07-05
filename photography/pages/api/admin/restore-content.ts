import { NextApiRequest, NextApiResponse } from 'next'
import { readSiteConfig, writeSiteConfig } from '../../../lib/siteConfig'

// One-time: restore welcomeVisible=true, hero=delicate-arch-at-dawn, push correct content.
// Remove after running.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.query.key !== 'restore-2026') return res.status(403).end()

  const config = await readSiteConfig()

  config.homepage.welcomeVisible = true
  config.homepage.heroPhotoId = 'delicate-arch-at-dawn'

  config.about.bio = `Imad Obegi is an artist whose creative journey began in the vibrant tapestry of childhood, where even as a toddler, an innate talent for selecting yarn colors for his mother hinted at a future immersed in the world of art. This early manifestation of artistic sensibility laid the foundation for a versatile artist, proficient in a myriad of mediums, including encaustic painting, oils, pastels, watercolor, and photography.

His artistic repertoire mirrors his deep appreciation for the beauty inherent in nature, serving as a perpetual muse for his work. Imad possesses an unbridled passion and an extensive background in portraiture and figure drawing, capturing the essence of his subjects with meticulous detail and emotional resonance.

What sets Imad Obegi apart is his unwavering commitment to the craft, evident in his deliberate choices of colors, composition, and lighting. Each element is carefully selected, not merely for aesthetic appeal, but with the deliberate intention of eliciting specific emotions in the viewer. His compositions are a harmonious dance of elements, inviting the audience to connect with the artwork on a profound, emotional level. Imad's love for nature extends beyond the canvas, transcending into his exploration of landscapes and digital media. Proficient in both traditional and contemporary mediums, he seamlessly blends his skills to create art that resonates with a diverse audience.

His accolades, including the first-place award for Best Catalina Art Scene and the second-place honor in the photography category at the Catalina Island Art Festival, winning 3 years consecutively at Berkeley's Chocolate and Chart Festival, he remains grounded in the simplicity of his love for art. Through his creations, Imad invites us to see the world through his unique perspective, where every stroke and pixel tells a story of passion, skill, and an unwavering connection to the beauty that surrounds us.`

  config.encaustics.headerText = 'Shop one of a kind encaustic art pieces. I take commissions. If you saw an encaustic on the gallery page that you liked and it is not available on the purchase page, please send me a note to recreate a similar piece or I can create a custom encaustic for you.'

  config.stickers.intro = 'These 3" × 3" vinyl stickers are an easy way to decorate your drink containers, car, computer, or other items. Be proud of activities that interest you, fondly remember the places you have visited, and are great conversation starters. Printed on thick, durable vinyl, they\'re weatherproof & waterproof. I can create a custom sticker for you or your business. Contact me using the custom form.'

  config.digitalDesign.intro = 'At OBG Illustrator, we pride ourselves on delivering exceptional graphic design solutions tailored to each client\'s vision. As a full-service design agency, we collaborate closely with our clients to develop unique and impactful designs — whether from scratch or by refining existing concepts. Led by award-winning designer Imad Obegi, we combine traditional artistry with advanced digital techniques to ensure every project exceeds expectations. With a proven track record, competitive pricing, and a commitment to excellence, OBG Illustrator guarantees a seamless process and outstanding results that leave clients fully satisfied with their finished product.'

  await writeSiteConfig(config)

  res.json({ ok: true, heroPhotoId: config.homepage.heroPhotoId, welcomeVisible: config.homepage.welcomeVisible })
}
