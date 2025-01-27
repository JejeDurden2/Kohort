import { NestFactory } from '@nestjs/core'

import { AppModule } from '../src/app.module'
import { OrganizationsService } from '../src/organizations/organizations.service'

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule)
  const organizationsService =
    app.get<OrganizationsService>(OrganizationsService)
  const organizations = await organizationsService.findAll()
  organizations.forEach(async (org) => {
    if (!org.svixApplicationId) {
      console.log(`Creating Svix application for ${org.id}`)
      try {
        await organizationsService.createSvixApplication(org)
      } catch (error) {
        console.log(`Error creating Svix application for ${org.id}`, error)
      }
    }
  })
  await app.close()
}

bootstrap()
