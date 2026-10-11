/**
 * Renders schema.org data as a JSON-LD script. `<` is escaped so text from the admin or from
 * reviews can never close the script tag (the approach the Next.js JSON-LD guide recommends).
 */
export default function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  // eslint-disable-next-line react/no-danger -- a data block, with every `<` escaped
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />
}
