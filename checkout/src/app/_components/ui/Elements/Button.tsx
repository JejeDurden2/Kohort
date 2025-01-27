import lightenHexColor from '../../utils/lighten-color'

type ButtonProps = {
  children?: React.ReactNode
  highlightColor?: string
  [key: string]: any
}

export default function Button({
  children,
  highlightColor,
  ...props
}: ButtonProps) {
  const lightenColor = lightenHexColor(highlightColor || '', 85)
  return (
    <button
      style={
        highlightColor
          ? {
              backgroundColor: '#' + highlightColor,
              ...(!highlightColor
                ? {}
                : {
                    border: '4px solid #' + lightenColor,
                    borderRadius: '12px',
                  }),
            }
          : {}
      }
      type="button"
      className={
        'mt-5 inline-flex w-full justify-center rounded-md p-3 font-semibold text-white shadow-sm ' +
        (!highlightColor && 'bg-primary ring-4 ring-primary ring-opacity-20')
      }
      {...props}
    >
      {children}
    </button>
  )
}
