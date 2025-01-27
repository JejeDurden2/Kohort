import Image from 'next/image'

type LogoProps = {
  format?: 'full' | 'icon'
  width?: number
  height?: number
  className?: string
}

export default function Logo({
  format = 'full',
  width = 215,
  height = 48,
  className,
}: LogoProps) {
  return (
    <Image
      alt="Logo"
      className={className}
      src={`/images/logos/${format}.svg`}
      width={width}
      height={height}
      priority={true}
    />
  )
}
