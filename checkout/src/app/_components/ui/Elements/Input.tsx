import { useState } from 'react'
import { UseFormRegister } from 'react-hook-form'

import T from '@locales/locale'

type InputProps = {
  name: string
  type: string
  autoComplete: string
  label: string
  errors?: any
  register?: UseFormRegister<any> | ((...args: any[]) => any)
  options?: any
  isDisabled?: boolean
  [key: string]: any
}

export default function Input({
  name,
  type,
  autoComplete,
  label,
  errors,
  register,
  options,
  isDisabled = false,
  ...props
}: InputProps) {
  const hasError = errors && errors[name]
  const [isFocus, setIsFocus] = useState(false)

  return (
    <>
      <div
        className={
          'h-14 rounded-md border border-grey-light px-3 focus-within:border-primary/50 focus-within:ring focus-within:ring-primary/25 ' +
          (hasError ? 'border-2 border-red ' : ' ') +
          (isFocus ? 'py-1' : 'py-4') +
          (isDisabled ? 'cursor-not-allowed bg-gray-100' : '')
        }
      >
        <label
          id={name}
          htmlFor={name}
          className={
            '-mb-0.5 mt-1.5 text-xs ' +
            (isFocus || isDisabled ? 'block' : 'hidden')
          }
        >
          {label}
        </label>
        <input
          type={type}
          id={name}
          tabIndex={0}
          disabled={isDisabled}
          onFocus={(e) => {
            e.target.placeholder = ''
            setIsFocus(true)
          }}
          autoComplete={autoComplete}
          placeholder={label}
          className={
            'block w-full border-0 p-0 font-normal placeholder:text-black placeholder:text-opacity-30 focus:ring-0 ' +
            (isDisabled ? 'cursor-not-allowed bg-gray-100' : '')
          }
          {...(register ? register(name, options) : {})}
          aria-invalid={hasError ? 'true' : 'false'}
          onBlur={(e) => {
            if (!e.target.value) {
              e.target.placeholder = label
              setIsFocus(false)
            }
          }}
          {...props}
        />
      </div>
      {hasError && (
        <p role="alert" className="mt-0.5 text-xs text-red">
          {T(errors[name]?.message)}
        </p>
      )}
    </>
  )
}
