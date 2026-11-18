import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

/**
 * Generate the referral link-preview PNG during the build.
 * No runtime SVG, remote image fetch, WASM layout, or third-party OG service.
 * Asset is served as a regular image from /public/images/.
 */
const root = process.cwd();
const logoPath = path.join(root, 'images/appiex-logo.png');
const pantherPath = path.join(root, 'images/panther_cover.webp');
const outPath = path.join(root, 'public/images/appiex-referral-linkedin.png');
const [logo, panther] = await Promise.all([
  sharp(logoPath).resize(77, 77, { fit: 'contain' }).png().toBuffer(),
  sharp(pantherPath).flop().resize(640, 670, { fit: 'cover', position: 'centre' }).jpeg({ quality: 88 }).toBuffer()
]);
const logo64 = logo.toString('base64');
const panther64 = panther.toString('base64');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs>
  <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
    <stop stop-color="#fdfdfd"/><stop offset=".70" stop-color="#f1f1f3"/><stop offset="1" stop-color="#d5d4d7"/>
  </linearGradient>
  <linearGradient id="r" x1="0" y1="0" x2="1" y2="1">
    <stop stop-color="#f80020"/><stop offset="1" stop-color="#9a0015"/>
  </linearGradient>
  <linearGradient id="fade" x1="0" x2="1">
    <stop offset="0" stop-color="#edf0f2" stop-opacity=".97"/>
    <stop offset=".72" stop-color="#edf0f2" stop-opacity="0"/>
  </linearGradient>
  <clipPath id="right"><path d="M835 0H1200V630H735L830 508L779 400L864 300L790 205Z"/></clipPath>
</defs>
<rect width="1200" height="630" fill="url(#bg)"/>
<path d="M870 0H1100L760 630H596Z" fill="#bcbcc2" opacity=".27"/>
<path d="M1140 0H1200V630H948Z" fill="url(#r)" opacity=".94"/>
<path d="M830 0H1200V630H736Z" fill="#17181b"/>
<g clip-path="url(#right)">
  <image x="705" y="-25" width="610" height="680" href="data:image/jpeg;base64,${panther64}" preserveAspectRatio="none"/>
</g>
<path d="M853 0L635 630" stroke="#ffffff" stroke-width="1.5" opacity=".52"/>
<path d="M1198 0L900 620" stroke="#fe0926" stroke-width="5" opacity=".78"/>
<path d="M790 558L1200 480" stroke="#ff0626" stroke-width="2" opacity=".85"/>
<rect x="0" y="0" width="795" height="630" fill="url(#fade)"/>
<image x="61" y="41" width="77" height="77" href="data:image/png;base64,${logo64}"/>
<rect x="156" y="60" width="2" height="39" fill="#222227" opacity=".55"/>
<text x="176" y="94" font-family="Arial,DejaVu Sans,sans-serif" font-size="42" font-weight="750" letter-spacing="-2" fill="#16171a">appie</text>
<text x="285" y="94" font-family="Arial,DejaVu Sans,sans-serif" font-size="43" font-weight="750" fill="#f00020">x</text>
<rect x="63" y="154" width="48" height="5" rx="2.5" fill="#f40823"/>
<text x="126" y="160" font-family="Arial,DejaVu Sans,sans-serif" font-weight="700" font-size="14" letter-spacing="4" fill="#55565d">REFERRAL PROGRAM</text>
<text x="64" y="255" font-family="Arial,DejaVu Sans,sans-serif" font-size="58" font-weight="750" letter-spacing="-2.8" fill="#17181b">Your Network</text>
<text x="64" y="318" font-family="Arial,DejaVu Sans,sans-serif" font-size="58" font-weight="750" letter-spacing="-2.8" fill="#17181b">Has Value.</text>
<text x="64" y="387" font-family="Arial,DejaVu Sans,sans-serif" font-size="67" font-weight="780" letter-spacing="-2.8" fill="#ef001e">Make It Pay!</text>
<rect x="62" y="435" width="584" height="96" rx="14" fill="#ffffff" opacity=".83"/>
<rect x="62" y="435" width="584" height="96" rx="14" fill="none" stroke="#b6b7bb" stroke-width="1.3"/>
<text x="86" y="465" font-family="Arial,DejaVu Sans,sans-serif" font-size="17" font-weight="750" letter-spacing="3" fill="#202024">EARN UP TO</text>
<text x="83" y="513" font-family="Arial,DejaVu Sans,sans-serif" font-size="52" font-weight="780" fill="#df001e">15%</text>
<text x="228" y="509" font-family="Arial,DejaVu Sans,sans-serif" font-size="28" font-weight="750" letter-spacing="1.1" fill="#17181b">COMMISSION</text>
<text x="65" y="569" font-family="Arial,DejaVu Sans,sans-serif" font-size="18" font-weight="740" letter-spacing=".6" fill="#202024">APPIEX.COM/REFER</text>
<text x="65" y="597" font-family="Arial,DejaVu Sans,sans-serif" font-size="13" fill="#62646b">On eligible paid projects. Approval and written terms apply.</text>
</svg>`;
await fs.mkdir(path.dirname(outPath), { recursive: true });
await sharp(Buffer.from(svg)).png({ compressionLevel: 9, palette: false }).toFile(outPath);
const out = await sharp(outPath).metadata();
if (out.width !== 1200 || out.height !== 630 || out.format !== 'png') throw new Error('Invalid referral OG image');
console.log('[Referral OG] Generated 1200x630 public/images/appiex-referral-linkedin.png');
