# gridsome-plugin-netlify-cms

This Gridsome plugin makes it easy to set up Netlify CMS to manage content on your Gridsome-generated site. 

[*Gridsome*](https://gridsome.org) is a Vue-powered static site generator for building CDN-ready websites for any headless CMS, local files or APIs

[*Netlify CMS*](https://netlifycms.org) is built for non-technical and technical editors alike, and it's super-easy to install and configure. 

## Install

```shell
npm install --save netlify-cms gridsome-plugin-netlify-cms
```

## How to use

Add the Netlify CMS plugin in your `gridsome.config.js`:

```javascript
  plugins: [
    {
      use: `gridsome-plugin-netlify-cms`
    } 
  ]
```

Then add your Netlify CMS [configuration
file](https://www.netlifycms.org/docs/add-to-your-site/#configuration) in
`src/admin/config.yml`.

## Options

`gridsome-plugin-netlify-cms` supports several options for customizing your Netlify CMS implementation. To provide options, add an `options` property to the plugin object in `gridsome.config.js`:

```javascript
  plugins: [
    {
      use: `gridsome-plugin-netlify-cms`,
      options: {
        publicPath: `/cms` 
      }
    } 
  ]
```

### `modulePath`

(_optional_, default: `undefined`)

If you need to customize Netlify CMS, e.g. registering [custom
widgets](https://www.netlifycms.org/docs/custom-widgets/#registerwidget) or
styling the [preview
pane](https://www.netlifycms.org/docs/customization/#registerpreviewstyle),
you'll need to do so in a JavaScript module and provide Gridsome with the path to
your module via the `modulePath` option. 

```javascript
  plugins: [
    {
      use: `gridsome-plugin-netlify-cms`,
      options: {
        modulePath: `src/admin/index.js` 
      }
    } 
  ]
```

The js module might look like this:

```javascript
/**
 * The default export of `netlify-cms` is an object with all of the Netlify CMS
 * extension registration methods, such as `registerWidget` and
 * `registerPreviewTemplate`.
 */
import CMS from "netlify-cms"

/**
 * Let's say you've created widget and preview components for a custom image
 * gallery widget in separate files:
 */
import ImageGalleryWidget from "./image-gallery-widget.js"
import ImageGalleryPreview from "./image-gallery-preview.js"

/**
 * Register the imported widget:
 */
CMS.registerWidget(`image-gallery`, ImageGalleryWidget, ImageGalleryPreview)
```

### `htmlPath`

(_optional_, default: `undefined`)

If you wish to provide a custom HTML file for your Netlify CMS implementation, you can reference its location here, e.g. `src/admin/index.html`. If you don't provide this option, `gridsome-plugin-netlify-cms` will create an HTML file for you.

### `configPath`

(_optional_, default: `"src/admin/config.yml"`)

If your Netlify CMS `config.yml` is in a different location to the default `src/admin/config.yml`, you can specify its location here.

### `publicPath`

(_optional_, default: `"/admin"`)

Customize the path to Netlify CMS on your Gridsome site.

### `htmlTitle`

(_optional_, default: `"Content Editor"`)

Customize the value of the `title` tag in your CMS HTML (shows in the browser
bar).

## Example

Here is the plugin with example values for all options (note that no option is
required):

```javascript
  plugins: [
    {
      use: `gridsome-plugin-netlify-cms`,
      options: {
        modulePath: `src/cms/index.js`,
        configPath: `src/cms/config.yml`,
        htmlPath: `src/cms/index.html`,
        publicPath: `/cms`,
        htmlTitle: `My CMS`
      }
    } 
  ]
```
