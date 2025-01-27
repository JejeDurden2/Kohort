import { Octokit } from 'octokit'

async function bootstrap() {
  // Environment variables will be undefined if you run this script locally
  const auth = process.env.GB_AUTH_TOKEN
  const env = process.env.NODE_ENV

  const octokit = new Octokit({
    auth,
  })

  await octokit.request(
    'POST /repos/kohortpay/e2e-tests/actions/workflows/main.yml/dispatches',
    {
      ref: 'main',
      inputs: {
        env,
      },
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  )
  process.exit(0)
}
bootstrap()
