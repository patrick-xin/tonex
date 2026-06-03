import { CameraIcon, CirclePlusIcon, CloudIcon, GlobeIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

const LINKS = [
  {
    id: 'spotify-url',
    label: 'Spotify Artist URL',
    icon: CirclePlusIcon,
    defaultValue: 'spotify.com/artist/3j...2k',
    placeholder: undefined,
  },
  {
    id: 'instagram-handle',
    label: 'Instagram Handle',
    icon: CameraIcon,
    defaultValue: '@julianduryea_music',
    placeholder: undefined,
  },
  {
    id: 'soundcloud-url',
    label: 'SoundCloud URL',
    icon: CloudIcon,
    defaultValue: undefined,
    placeholder: 'soundcloud.com/username',
  },
  {
    id: 'website-url',
    label: 'Website',
    icon: GlobeIcon,
    defaultValue: undefined,
    placeholder: 'https://yoursite.com',
  },
]

export function SocialLinks() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Links</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          {LINKS.map(({ id, label, icon: Icon, defaultValue, placeholder }) => (
            <Field key={id}>
              <FieldLabel htmlFor={id}>{label}</FieldLabel>
              <div className="relative">
                <Icon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-on-surface-variant" />
                <Input
                  id={id}
                  defaultValue={defaultValue}
                  placeholder={placeholder}
                  className="pl-9"
                />
              </div>
            </Field>
          ))}
        </div>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="secondary">Discard</Button>
        <Button>Save Changes</Button>
      </CardFooter>
    </Card>
  )
}
