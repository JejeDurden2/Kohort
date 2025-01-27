import { NestFactory } from '@nestjs/core'

// Adjust the path to your AppModule
import { AppModule } from '../src/app.module'
import { PaymentGroupsService } from '../src/payment-groups/payment-groups.service'

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule)
  const paymentGroupsService =
    appContext.get<PaymentGroupsService>(PaymentGroupsService)

  // Retrieve the ID argument from the command line
  const paymentGroupId = process.argv[2]
  if (!paymentGroupId) {
    console.error('No payment group ID provided.')
    process.exit(1)
  }

  try {
    await paymentGroupsService.process(paymentGroupId)
  } catch (error) {
    console.error('Error during capture:', error)
  } finally {
    await appContext.close()
    process.exit(0)
  }
}

bootstrap()
