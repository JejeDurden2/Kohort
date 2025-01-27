import { authMiddleware, redirectToSignIn } from '@clerk/nextjs'
import { NextResponse } from 'next/server'

// @READ : https://clerk.com/docs/nextjs/middleware#using-after-auth-for-fine-grain-control
export default authMiddleware({
  afterAuth(auth, req) {
    if (!auth.userId && !auth.isPublicRoute) {
      return redirectToSignIn({ returnBackUrl: req.url })
    }

    if (
      auth.userId &&
      !auth.orgId &&
      req.nextUrl.pathname !== '/sign-organization'
    ) {
      const createOrganizationUrl = new URL('/sign-organization', req.url)
      return NextResponse.redirect(createOrganizationUrl)
    }
  },
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
