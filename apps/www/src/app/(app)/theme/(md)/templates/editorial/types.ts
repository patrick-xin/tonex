export interface Project {
  id: string
  number: string
  title: string
  serifAccent: string
  tags: string[]
  year: string
  category: 'all' | 'branding' | 'editorial' | 'digital' | 'type'
  description: string
  client: string
  medium: string
  dimension: string
  image: string
}

export interface Capability {
  id: number
  number: string
  title: string
  serfWord: string
  description: string
  details: string[]
}

export interface Honor {
  id: string
  award: string
  category: string
  year: string
}

export interface BookableSlot {
  id: string
  day: string
  time: string
  available: boolean
}
