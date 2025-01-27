'use client'

import { CallAPI } from '@services/CallApi'

export default function Home() {
  CallAPI('/users').then((p) => console.log(p))

  return <main></main>
}
