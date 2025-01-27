# Script Execution Guide

## Running `example-script.ts` Locally
To run `example-script.ts` locally, execute the following command:
```bash
ts-node example-script.ts
```

## Running `example-script.ts` in Staging or Production
To run `example-script.ts` in Heroku, execute the following commands:
```bash
heroku run bash --app {app-name-here}
```
Once connected to the app's bash, enter the script folder in dist and run the js file
```bash
cd dist/scripts
```
```bash
node example-script.js
```

# Coding a script
If you need to create a new typescript script from scratch, just use the following template:
```typescript
async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule)
  const exampleService = appContext.get<ExampleService>(ExampleService)

  await exampleService.doSomething()

  await appContext.close()
  process.exit(0)
}

bootstrap()
```
Just make sure you store it in the scripts folder.