/**
 * Splits a string into per-character spans that animate in.
 * The animation stays paused until an ancestor gets `data-visible="true"`
 * (see the `.char` rules in globals.css), so it pairs with <Reveal>.
 */
export function SplitText({
  text,
  className,
  step = 22,
  start = 0,
}: {
  text: string
  className?: string
  step?: number
  start?: number
}) {
  const words = text.split(' ')
  let index = 0

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, wordIndex) => (
          <span key={`${word}-${wordIndex}`} className="inline-block whitespace-nowrap">
            {Array.from(word).map((char, charIndex) => {
              const delay = start + index * step
              index += 1
              return (
                <span
                  key={`${char}-${charIndex}`}
                  className="char"
                  style={{ ['--char-delay' as string]: `${delay}ms` }}
                >
                  {char}
                </span>
              )
            })}
            {wordIndex < words.length - 1 ? <span className="inline-block">&nbsp;</span> : null}
          </span>
        ))}
      </span>
    </span>
  )
}
