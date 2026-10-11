import { buildLlmsTxt } from '@/server/llms'

// Rebuilt at most every five minutes, like the catalogue it describes.
export const revalidate = 300

export async function GET() {
  return new Response(await buildLlmsTxt({ full: true }), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'X-Robots-Tag': 'noindex' },
  })
}
