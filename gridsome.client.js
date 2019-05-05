/* global __PATH_PREFIX__ */
/**
 * Inspired by gatsby-plugin-netlify-cms
 * https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-plugin-netlify-cms/src/gatsby-browser.js
 */

// Taken from https://github.com/netlify/netlify-identity-widget
const routes = /(confirmation|invite|recovery|email_change)_token=([^&]+)/
const errorRoute = /error=access_denied&error_description=403/
const accessTokenRoute = /access_token=/

const onInitialClientRender = ({ hash, enableIdentityWidget, publicPath }) => {
  if (
    enableIdentityWidget &&
    (routes.test(hash) || errorRoute.test(hash) || accessTokenRoute.test(hash))
  ) {
    import(`netlify-identity-widget`).then(
      ({ default: netlifyIdentityWidget }) => {
        netlifyIdentityWidget.on(`init`, user => {
          if (!user) {
            netlifyIdentityWidget.on(`login`, () => {
              document.location.href = `${__PATH_PREFIX__}${publicPath}/`
            })
          }
        })
        netlifyIdentityWidget.init()
      }
    )
  }
}

export default function(Vue, { enableIdentityWidget, publicPath }, { router }) {
  router.onReady(({ hash }) =>
    onInitialClientRender({
      enableIdentityWidget,
      publicPath,
      hash,
    })
  )
}
