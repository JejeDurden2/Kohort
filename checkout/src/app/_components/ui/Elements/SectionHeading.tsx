import T from '@locales/locale'

type SectionHeadingProps = {
  title: string
  description?: string
  children?: React.ReactNode
}

export default function SectionHeading({
  title,
  description,
  children,
}: SectionHeadingProps) {
  return (
    <div className="relative pb-6 text-center">
      <div>
        <h2 id={title} className="mb-1 px-6 text-2xl font-semibold">
          {T(title)}
        </h2>
        {description && <p className="px-8">{T(description)}</p>}
        {children && <p className="px-8">{children}</p>}
      </div>
    </div>
  )
}
