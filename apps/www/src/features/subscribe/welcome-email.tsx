import { Body, Container, Head, Heading, Html, Link, Preview, Text } from '@react-email/components'

export function WelcomeEmail({ roadmapUrl }: { roadmapUrl: string }) {
  return (
    <Html>
      <Head />
      <Preview>You're in. Here's what's next for tonex.</Preview>
      <Body>
        <Container>
          <Heading as="h1">Welcome to tonex</Heading>
          <Text>
            Thanks for signing up. tonex turns a logo or seed color into a copy-paste-ready theme
            for Material Design and shadcn.
          </Text>
          <Text>
            See what's shipping next: <Link href={roadmapUrl}>{roadmapUrl}</Link>.
          </Text>
          <Text>Reply with one thing you wish tonex did. I read every reply.</Text>
        </Container>
      </Body>
    </Html>
  )
}
