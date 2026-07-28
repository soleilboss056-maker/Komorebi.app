'use client'

import { useEffect, useState } from 'react'

const words = ['Gérer', 'Protéger', 'Animer', 'Modérer', 'Récompenser']

export function RotatingWords() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((value) => (value + 1) % words.length)
    }, 2600)
    return () => clearInterval(timer)
  }, [])

  return (
    <span className="word-slot">
      <span className="invisible" aria-hidden="true">
        Récompenser
      </span>
      {words.map((word, i) => (
        <span
          key={word}
          data-active={i === index ? 'true' : 'false'}
          aria-hidden={i === index ? undefined : 'true'}
          className={
            i === index ? 'text-shimmer' : 'text-shimmer pointer-events-none select-none'
          }
        >
          {word}
        </span>
      ))}
    </span>
  )
}
