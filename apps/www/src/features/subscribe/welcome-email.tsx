import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from 'react-email'
import { SITE_CONFIG } from '@/lib/site-config'
import { EmailFonts } from './fonts'
import { emailTailwindConfig } from './theme'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ? `https://${process.env.NEXT_PUBLIC_APP_URL}` : ''

type WelcomeTip = {
  title: string
  description: string
}

interface WelcomeEmailProps {
  companyName: string
  url: string
}

export const WelcomeEmail = ({ companyName, url }: WelcomeEmailProps) => {
  const brand = SITE_CONFIG.brand
  const welcomeTitle = `Welcome to ${brand}`

  const tips: WelcomeTip[] = [
    {
      title: 'Start from any color',
      description:
        'Drop in a hex or a brand color. Every role is generated from that one seed — never hand-picked, so the whole palette stays in tune.',
    },
    {
      title: 'Contrast, guaranteed',
      description:
        'Every theme is checked against WCAG in both light and dark, so your text stays legible on every surface.',
    },
    {
      title: 'Export anywhere',
      description:
        'Copy paste-ready tokens for shadcn and Tailwind, or design.md and Material — then bind the roles however your UI needs.',
    },
  ]

  return (
    <Tailwind config={emailTailwindConfig}>
      <Html>
        <Head>
          <EmailFonts />
        </Head>

        <Body className="bg-surface font-14 font-sans text-on-surface m-0 p-0">
          <Preview>Welcome to {brand} — one seed color, a whole theme</Preview>
          <Container className="mx-auto max-w-[640px] px-4 pt-16 pb-6">
            <Section className="shadow-card rounded-[8px]">
              <Section className="bg-surface-container-lowest border-outline-variant rounded-[8px] border overflow-hidden">
                <Section className="p-0">
                  <Img
                    src={`${baseUrl}/placeholder.png`}
                    alt=""
                    width={608}
                    className="block w-full max-w-[608px] border-none"
                  />
                </Section>

                <Section className="mobile:px-6! mobile:pt-10 px-10 pt-20 pb-14 text-left">
                  <Section className="mb-9 text-left">
                    <Text className="font-48 text-on-surface m-0 font-serif">{welcomeTitle}</Text>
                    <Text className="font-14 font-sans text-on-surface-variant m-0 mt-[18px]">
                      Thanks for subscribing. {brand} turns a single seed color into a complete,
                      WCAG-contrast-checked theme — light and dark — ready to paste into shadcn,
                      Tailwind, and beyond.
                    </Text>
                    <Text className="font-14 font-sans text-on-surface-variant m-0">
                      We&apos;ll send the occasional note when something worth your time ships.
                    </Text>
                  </Section>

                  <Section className="text-left">
                    <Button
                      href={url}
                      className="bg-primary font-15 font-sans text-on-primary inline-block border-none px-5 py-3.5 text-center"
                    >
                      See the roadmap
                    </Button>
                  </Section>
                </Section>

                <Section className="bg-surface-container mobile:px-0! px-4 mobile:py-16! py-20">
                  <Section className="px-6">
                    <Text className="font-48 text-on-surface m-0 max-w-[400px] font-serif">
                      From one color to a whole system
                    </Text>
                    <Text className="font-14 font-sans text-on-surface-variant m-0 mt-[18px] max-w-[479px]">
                      {brand} does the color math so you don&apos;t have to — coherent roles, in
                      light and dark, that stay legible wherever you put them.
                    </Text>
                  </Section>
                  <Section className="px-6 pt-14">
                    <Text className="font-15 font-sans text-on-surface m-0">
                      What&apos;s inside:
                    </Text>
                    <Section className="pt-9">
                      {tips.map((item, idx) => (
                        <Section key={String(idx)} className="border-outline-variant border-b py-6">
                          <Row>
                            <Column className="w-[92%] align-top">
                              <Text className="font-20 font-sans text-on-surface m-0 leading-normal">
                                {item.title}
                              </Text>
                              <Text className="font-14 font-sans text-on-surface-variant m-0 mt-1 max-w-[380px]">
                                {item.description}
                              </Text>
                            </Column>
                            {/* Arror img */}
                            <Column className="w-[8%] text-right align-middle">
                              <Img
                                src={`${baseUrl}/placeholder.png`}
                                alt=""
                                width={12}
                                height={12}
                                className="inline-block border-none align-middle"
                              />
                            </Column>
                          </Row>
                        </Section>
                      ))}
                    </Section>
                  </Section>
                </Section>

                <Section className="p-0">
                  <Img
                    src={`${baseUrl}/static/collage/collage-image-4.png`}
                    alt=""
                    width={608}
                    className="block w-full max-w-[608px] border-none"
                  />
                </Section>

                <Section className="border-outline-variant border-t px-10 py-16">
                  <Text className="font-13 font-sans text-on-surface-variant m-0 max-w-[320px]">
                    {brand} turns a seed color into a complete, contrast-checked theme system —
                    light and dark, ready to ship.
                  </Text>

                  <Row align="left">
                    <Column className="w-full align-top">
                      <Section align="left" className="mt-8 w-[152px]">
                        <Row align="left">
                          {/* X img */}
                          <Column className="w-5 pr-2">
                            <Link href={SITE_CONFIG.social.x} className="inline-block">
                              <Img
                                src={`${baseUrl}/static/shared/social-x-black.png`}
                                alt="X"
                                width={20}
                                height={20}
                                className="block border-none"
                              />
                            </Link>
                          </Column>
                          {/* GH img */}
                          <Column className="w-5">
                            <Link href={SITE_CONFIG.social.github} className="inline-block">
                              <Img
                                src={`${baseUrl}/static/shared/social-gh-black.png`}
                                alt="GitHub"
                                width={20}
                                height={20}
                                className="block border-none"
                              />
                            </Link>
                          </Column>
                        </Row>
                      </Section>
                    </Column>
                  </Row>

                  <Row align="left">
                    <Column className="w-full pt-8 align-top">
                      <Text className="font-11 font-mono text-on-surface-variant m-0">tonex</Text>
                    </Column>
                  </Row>

                  <Row align="left">
                    <Column className="w-full pt-5 align-top">
                      <Text className="font-11 font-sans text-on-surface-variant m-0 max-w-[200px]">
                        <Link href="https://example.com/" className="text-on-surface-variant">
                          Unsubscribe
                        </Link>{' '}
                        from {companyName} updates.
                      </Text>
                    </Column>
                  </Row>
                </Section>
              </Section>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  )
}

WelcomeEmail.PreviewProps = {
  companyName: 'tonex',
  url: 'https://example.com/',
} satisfies WelcomeEmailProps

export default WelcomeEmail
