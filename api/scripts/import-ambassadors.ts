import { NestFactory } from '@nestjs/core'
import * as csv from 'fast-csv'
import * as fs from 'fs'

import { AmbassadorService } from '../src/ambassador/ambassador.service'
import { AppModule } from '../src/app.module'
import { DefaultScopedLoggerService } from '../src/logger/logger.service'

interface CsvRow {
  'Phone Number': string
}

function formatPhoneNumber(phone: string): string {
  // Remove any spaces, dots, or other separators
  const cleanNumber = phone.replace(/[\s.-]/g, '')

  if (cleanNumber.startsWith('+33')) {
    return cleanNumber
  }

  if (cleanNumber.startsWith('0')) {
    return `+33${cleanNumber.slice(1)}`
  }

  // If it's just the 9 digits, add +33
  if (/^\d{9}$/.test(cleanNumber)) {
    return `+33${cleanNumber}`
  }

  return `+33${cleanNumber}`
}

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule)
  const ambassadorService = appContext.get<AmbassadorService>(AmbassadorService)
  const logger = appContext.get<DefaultScopedLoggerService>(
    DefaultScopedLoggerService
  )

  const csvFilePath = process.argv[2]
  if (!csvFilePath) {
    console.error('Please provide a CSV file path')
    process.exit(1)
  }

  const ambassadors: CsvRow[] = []

  try {
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv.parse({ headers: true }))
        .on('error', (error) => {
          logger.error('Error parsing CSV:', error.stack, {
            service: 'ImportAmbassadorsScript',
            function: 'bootstrap',
          })
          reject(error)
        })
        .on('data', (row: CsvRow) => ambassadors.push(row))
        .on('end', resolve)
    })

    logger.log(`Found ${ambassadors.length} ambassadors to import`, {
      service: 'ImportAmbassadorsScript',
      function: 'bootstrap',
    })

    for (const ambassador of ambassadors) {
      try {
        const rawPhoneNumber = ambassador['Phone Number'].trim()

        if (!rawPhoneNumber) {
          logger.warn('Skipping empty phone number', {
            service: 'ImportAmbassadorsScript',
            function: 'bootstrap',
          })
          continue
        }

        const formattedPhoneNumber = formatPhoneNumber(rawPhoneNumber)

        // Create ambassador with formatted phone number
        await ambassadorService.create({
          phoneNumber: formattedPhoneNumber,
        })

        logger.log(
          `Successfully created ambassador with phone: ${formattedPhoneNumber}`,
          {
            service: 'ImportAmbassadorsScript',
            function: 'bootstrap',
            originalPhone: rawPhoneNumber,
            formattedPhone: formattedPhoneNumber,
          }
        )
      } catch (error) {
        logger.error(
          `Error creating ambassador: ${error.message}`,
          error.stack,
          {
            service: 'ImportAmbassadorsScript',
            function: 'bootstrap',
            ambassador: ambassador['Phone Number'],
          }
        )
      }
    }

    logger.log('Import completed', {
      service: 'ImportAmbassadorsScript',
      function: 'bootstrap',
    })
  } catch (error) {
    logger.error('Script failed:', error.stack, {
      service: 'ImportAmbassadorsScript',
      function: 'bootstrap',
    })
  } finally {
    await appContext.close()
    process.exit(0)
  }
}

bootstrap()
