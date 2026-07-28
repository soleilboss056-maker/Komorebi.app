type Petal = {
  left: number
  size: number
  duration: number
  delay: number
  drift: number
  opacity: number
}

// Deterministic values so server and client markup match exactly.
const petals: Petal[] = [
  { left: 4, size: 10, duration: 15, delay: 0, drift: 60, opacity: 0.5 },
  { left: 12, size: 7, duration: 19, delay: 3, drift: -40, opacity: 0.35 },
  { left: 21, size: 12, duration: 13, delay: 6, drift: 90, opacity: 0.45 },
  { left: 29, size: 6, duration: 22, delay: 1.5, drift: -70, opacity: 0.3 },
  { left: 38, size: 9, duration: 17, delay: 8, drift: 50, opacity: 0.4 },
  { left: 47, size: 11, duration: 14, delay: 4.5, drift: -55, opacity: 0.45 },
  { left: 56, size: 7, duration: 20, delay: 10, drift: 75, opacity: 0.32 },
  { left: 64, size: 13, duration: 16, delay: 2, drift: -85, opacity: 0.5 },
  { left: 72, size: 8, duration: 21, delay: 7, drift: 45, opacity: 0.35 },
  { left: 81, size: 10, duration: 15, delay: 11, drift: -60, opacity: 0.42 },
  { left: 89, size: 6, duration: 18, delay: 5, drift: 80, opacity: 0.3 },
  { left: 95, size: 12, duration: 23, delay: 9, drift: -50, opacity: 0.38 },
]

export function Petals() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {petals.map((petal, index) => (
        <span
          key={index}
          className="petal"
          style={{
            left: `${petal.left}%`,
            width: `${petal.size}px`,
            height: `${petal.size}px`,
            opacity: petal.opacity,
            animationDuration: `${petal.duration}s`,
            animationDelay: `${petal.delay}s`,
            ['--drift' as string]: `${petal.drift}px`,
          }}
        />
      ))}
    </div>
  )
}
