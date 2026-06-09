'use client'

import { SunIcon, ThermometerIcon, TimerIcon, Volume2Icon } from 'lucide-react'
import * as React from 'react'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

const SCENES = {
  movie: { intensity: [40], warmth: [30], speed: [10], saturation: [50] },
  reading: { intensity: [85], warmth: [60], speed: [0], saturation: [70] },
  party: { intensity: [100], warmth: [50], speed: [80], saturation: [100] },
  relax: { intensity: [30], warmth: [80], speed: [20], saturation: [40] },
} as const

export function KitchenIsland() {
  const [enabled, setEnabled] = React.useState(true)
  const [scene, setScene] = React.useState('movie')
  const [intensity, setIntensity] = React.useState([40])
  const [warmth, setWarmth] = React.useState([30])
  const [speed, setSpeed] = React.useState([10])
  const [saturation, setSaturation] = React.useState([50])

  const handleSceneChange = (value: string) => {
    if (!value) return
    setScene(value)
    const preset = SCENES[value as keyof typeof SCENES]
    setIntensity([...preset.intensity])
    setWarmth([...preset.warmth])
    setSpeed([...preset.speed])
    setSaturation([...preset.saturation])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Living Room</CardTitle>
        <CardDescription>Smart Lighting Control</CardDescription>
        <CardAction>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span className="sr-only">Scenes</span>
          <ToggleGroup
            value={[scene]}
            onValueChange={(value) => handleSceneChange(value[0] ?? 'movie')}
            variant="outline"
            spacing={1}
            className="flex-wrap"
          >
            <ToggleGroupItem value="movie" disabled={!enabled}>
              Movie
            </ToggleGroupItem>
            <ToggleGroupItem value="reading" disabled={!enabled}>
              Reading
            </ToggleGroupItem>
            <ToggleGroupItem value="party" disabled={!enabled}>
              Party
            </ToggleGroupItem>
            <ToggleGroupItem value="relax" disabled={!enabled}>
              Relax
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <ItemGroup>
          <Item size="sm" variant="default">
            <ItemMedia variant="icon">
              <SunIcon />
            </ItemMedia>
            <ItemContent className="flex-row items-center gap-3">
              <ItemTitle className="shrink-0">Intensity</ItemTitle>
            </ItemContent>
            <ItemActions className="flex-1">
              <Slider
                value={intensity}
                onValueChange={(value) => setIntensity(Array.isArray(value) ? [...value] : [value])}
                max={100}
                disabled={!enabled}
                className="w-full"
              />
            </ItemActions>
          </Item>
          <Item size="sm" variant="default">
            <ItemMedia variant="icon">
              <ThermometerIcon />
            </ItemMedia>
            <ItemContent className="flex-row items-center gap-3">
              <ItemTitle className="shrink-0">Warmth</ItemTitle>
            </ItemContent>
            <ItemActions className="flex-1">
              <Slider
                value={warmth}
                onValueChange={(value) => setWarmth(Array.isArray(value) ? [...value] : [value])}
                max={100}
                disabled={!enabled}
              />
            </ItemActions>
          </Item>
          <Item size="sm" variant="default">
            <ItemMedia variant="icon">
              <Volume2Icon />
            </ItemMedia>
            <ItemContent className="flex-row items-center gap-3">
              <ItemTitle className="shrink-0">Speed</ItemTitle>
            </ItemContent>
            <ItemActions className="flex-1">
              <Slider
                value={speed}
                onValueChange={(value) => setSpeed(Array.isArray(value) ? [...value] : [value])}
                max={100}
                disabled={!enabled}
              />
            </ItemActions>
          </Item>
          <Item size="sm" variant="default">
            <ItemMedia variant="icon">
              <TimerIcon />
            </ItemMedia>
            <ItemContent className="flex-row items-center gap-3">
              <ItemTitle className="shrink-0">Saturation</ItemTitle>
            </ItemContent>
            <ItemActions className="flex-1">
              <Slider
                value={saturation}
                onValueChange={(value) =>
                  setSaturation(Array.isArray(value) ? [...value] : [value])
                }
                max={100}
                disabled={!enabled}
              />
            </ItemActions>
          </Item>
        </ItemGroup>
      </CardContent>
    </Card>
  )
}
