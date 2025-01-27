import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import axios from 'axios'

import { AppModule } from '../src/app.module'

async function bootstrap(totalCalls: number) {
  const appContext = await NestFactory.createApplicationContext(AppModule)
  const configService = appContext.get<ConfigService>(ConfigService)
  const checkoutSessionUrl = `${configService.get('API_BASE_URL')}/checkout-sessions`
  const paymentGroupsUrl = `${process.env.API_BASE_URL}/payment-groups`

  for (let i = 0; i < totalCalls; i++) {
    try {
      let response = await axios.post(
        checkoutSessionUrl,
        {
          lineItems: [
            {
              price: 12345,
              quantity: 1,
              name: 'test',
              description: 'lorem ipsum',
              imageUrl: 'https://via.placeholder.com/150',
            },
          ],
          amountTotal: 12345,
          customerFirstName: 'John',
          customerLastName: 'Doe',
          customerEmail: 'jerome.desmares@kohort.eu',
        },
        {
          headers: {
            Authorization: `Bearer ${configService.get('BIG_MAMMA_SECRET_KEY')}`,
            ContentType: 'application/json',
          },
        }
      )
      if (i % 2 === 0) {
        try {
          response = await axios.get(
            `${checkoutSessionUrl}/${response.data.id}?expand[]=paymentIntent`,
            {
              headers: {
                Authorization: `Bearer ${process.env.BIG_MAMMA_SECRET_KEY}`,
              },
            }
          )
          const paymentGroupId = response.data.payment_intent.payment_group_id
          response = await axios.post(
            `${paymentGroupsUrl}/${paymentGroupId}/validate`,
            {},
            {
              headers: {
                Authorization: `Bearer ${process.env.BIG_MAMMA_SECRET_KEY}`,
              },
            }
          )

          await axios.post(
            checkoutSessionUrl,
            {
              lineItems: [
                {
                  price: 12345,
                  quantity: 1,
                  name: 'test',
                  description: 'lorem ipsum',
                  imageUrl: 'https://via.placeholder.com/150',
                },
              ],
              amountTotal: 12345,
              customerFirstName: 'John',
              customerLastName: 'Doe',
              customerEmail: 'jerome.desmares+bigmamma@kohort.eu',
              paymentGroupShareId: response.data.share_id,
            },
            {
              headers: {
                Authorization: `Bearer ${configService.get('BIG_MAMMA_SECRET_KEY')}`,
                ContentType: 'application/json',
              },
            }
          )
        } catch (error) {
          console.error(`Error on call ${i + 1}:`, error.response.data)
        }
      }
    } catch (error) {
      console.error(`Error on call ${i + 1}:`, error.response.data)
    }
  }

  appContext.close()
  process.exit(1)
}

const args = process.argv.slice(2)
if (args.length !== 1) {
  console.log('Usage: node makeApiCalls.js <number of payments to create>')
  process.exit(1)
}

const totalCalls = parseFloat(args[0])

if (isNaN(totalCalls) || totalCalls <= 0) {
  console.log('Invalid totalCalls parameter')
  process.exit(1)
}

bootstrap(totalCalls).then(() => {
  console.log(`Started making ${totalCalls} API calls`)
})
