import Image from 'next/image'

interface SuperImageProps {
  src: string
  width: number
  height?: number
  className?: string
  style?: React.CSSProperties
}

export default function SuperImage({
  src,
  width,
  height,
  className,
  style,
}: SuperImageProps) {
  return (
    <Image
      src={src}
      width={width}
      height={height ?? width}
      alt={src.split('/').pop()?.split('.')[0] ?? ''}
      className={className}
      priority={true}
      style={style}
    />
  )
}
