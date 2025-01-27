import NextLink from 'next/link'

type LinkProps = {
  children?: React.ReactNode
  [key: string]: any
}

export default function Link({ children, ...props }: LinkProps) {
  const linkHref = (props.href as string) || '#'
  let linkProps = { ...props }

  if (!linkHref.startsWith('/') && !linkHref.startsWith('#')) {
    linkProps = { ...linkProps, rel: 'noopener noreferrer', target: '_blank' }
  }

  return (
    <NextLink
      href={linkHref}
      {...linkProps}
      className={'underline ' + linkProps.className}
    >
      {children}
    </NextLink>
  )
}
