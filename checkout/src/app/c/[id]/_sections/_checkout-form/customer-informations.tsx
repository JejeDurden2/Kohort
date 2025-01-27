import { UseFormRegister } from 'react-hook-form'

import T from '@locales/locale'

import Input from '@ui/Elements/Input'

interface CustomerData {
  customer_id?: string
  customer_first_name: string
  customer_last_name: string
  customer_email: string
  payment_group_share_id: string
}

interface CustomerInformationsSectionProps {
  data: CustomerData
  register: UseFormRegister<{
    customer_first_name: string
    customer_last_name: string
    customer_email: string
    payment_group_share_id: string
  }>

  errors: Record<string, any>
}
export default function CustomerInformationsSection({
  data,
  register,
  errors,
}: CustomerInformationsSectionProps) {
  if (data.customer_id) {
    return <></>
  }

  if (
    data.customer_email &&
    data.customer_first_name &&
    data.customer_last_name
  ) {
    return <></>
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return (
    <div className="mb-8">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-1">
          <Input
            name="customer_first_name"
            type="text"
            autoComplete="given-name"
            label={T('checkout.customer.fields.first_name.label')}
            errors={errors}
            register={register}
            options={{
              required: T('checkout.customer.fields.first_name.required'),
            }}
          />
        </div>
        <div className="col-span-1">
          <Input
            name="customer_last_name"
            type="text"
            autoComplete="family-name"
            label={T('checkout.customer.fields.last_name.label')}
            errors={errors}
            register={register}
            options={{
              required: T('checkout.customer.fields.last_name.required'),
            }}
          />
        </div>
        <div className="col-span-2">
          <Input
            name="customer_email"
            type="email"
            autoComplete="email"
            label={T('checkout.customer.fields.email.label')}
            errors={errors}
            register={register}
            options={{
              required: T('checkout.customer.fields.email.required'),
              pattern: {
                value: emailRegex,
                message: T('checkout.customer.fields.email.invalid'),
              },
            }}
          />
        </div>
      </div>
    </div>
  )
}
