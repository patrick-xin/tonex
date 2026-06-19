import { Font } from 'react-email'

// DESIGN.md type voices, loaded for clients that honor webfonts (most fall back
// to the platform serif/sans, which is why the fallback stacks matter most).
export function EmailFonts() {
  return (
    <>
      <Font
        fontFamily="Vidaloka"
        fallbackFontFamily={['Georgia', 'serif']}
        webFont={{
          url: 'https://fonts.gstatic.com/s/vidaloka/v19/7cHrv4c3ipenMKlEavs7wH8Dnzcj.woff2',
          format: 'woff2',
        }}
        fontWeight={400}
        fontStyle="normal"
      />
      <Font
        fontFamily="IBM Plex Sans"
        fallbackFontFamily={['Arial', 'sans-serif']}
        webFont={{
          url: 'https://fonts.gstatic.com/s/ibmplexsans/v23/zYXGKVElMYYaJe8bpLHnCwDKr932-G7dytD-Dmu1swZSAXcomDVmadSD6llDB6g4tIOm6_De.woff2',
          format: 'woff2',
        }}
        fontWeight={400}
        fontStyle="normal"
      />
      <Font
        fontFamily="IBM Plex Sans"
        fallbackFontFamily={['Arial', 'sans-serif']}
        webFont={{
          url: 'https://fonts.gstatic.com/s/ibmplexsans/v23/zYXGKVElMYYaJe8bpLHnCwDKr932-G7dytD-Dmu1swZSAXcomDVmadSD2FlDB6g4tIOm6_De.woff2',
          format: 'woff2',
        }}
        fontWeight={500}
        fontStyle="normal"
      />
      <Font
        fontFamily="IBM Plex Sans"
        fallbackFontFamily={['Arial', 'sans-serif']}
        webFont={{
          url: 'https://fonts.gstatic.com/s/ibmplexsans/v23/zYXGKVElMYYaJe8bpLHnCwDKr932-G7dytD-Dmu1swZSAXcomDVmadSDNF5DB6g4tIOm6_De.woff2',
          format: 'woff2',
        }}
        fontWeight={600}
        fontStyle="normal"
      />
      <Font
        fontFamily="IBM Plex Mono"
        fallbackFontFamily={['monospace']}
        webFont={{
          url: 'https://fonts.gstatic.com/s/ibmplexmono/v20/-F63fjptAgt5VM-kVkqdyU8n1i8q131nj-o.woff2',
          format: 'woff2',
        }}
        fontWeight={400}
        fontStyle="normal"
      />
    </>
  )
}
