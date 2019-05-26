import { IProvider } from 'react-simple-auth'

export interface Session {
    accessToken: string
}

const authenticateUrl = "https://untappd.com/oauth/authenticate/"
const authorizeUrl = "https://untappd.com/oauth/authorize/"

// https://untappd.com/api/docs#authentication
export const untappdProvider: IProvider<Session> = {
    buildAuthorizeUrl() {
      let url = `${authenticateUrl}?client_id=CLIENT_ID&response_type=token&redirect_url=${encodeURIComponent(`${window.location.origin}/redirect.html`)}`
      console.log(url)
      return url
    },

    extractError(redirectUrl: string): Error | undefined {
      const errorMatch = redirectUrl.match(/error=([^&]+)/)
      if (!errorMatch) {
        return undefined
      }

      const errorReason = errorMatch[1]
      const errorDescriptionMatch = redirectUrl.match(/error_description=([^&]+)/)
      const errorDescription = errorDescriptionMatch ? errorDescriptionMatch[1] : ''
      return new Error(`Error during login. Reason: ${errorReason} Description: ${errorDescription}`)
    },

    extractSession(redirectUrl: string): Session {
      console.log(redirectUrl)
      let accessToken = null
      const accessTokenMatch = redirectUrl.match(/access_token=([^&]+)/)
      if (accessTokenMatch) {
          accessToken = accessTokenMatch[1]
      }
      console.log(accessToken)

      return {accessToken}
    },

    validateSession(session: Session): boolean {
        // Untappd sessions never expire
        return true
    },

    getAccessToken(session: Session, resourceId: string): string {
        return session.accessToken
    }
}
