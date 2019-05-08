
import React from 'react'
import Vue from 'vue'
import main from '~/main.js'

import BlogPostTemplate from '~/templates/BlogPost.vue'
BlogPostTemplate.props = { $page: {} }

main(Vue, { head: {link: []}, router: null, isServer: false })

var app

const toCamelCase = (str) => {
  return str.replace(/([-_][a-z])/ig, ($1) => {
    return $1.toUpperCase()
      .replace('-', '')
      .replace('_', '')
  });
}

const keysToCamelCase = (obj) => {
  var newObj = {}
  for(var key of Object.keys(obj)) {
    newObj[toCamelCase(key)] = obj[key]
  }
  return newObj
}

export default function(CMS) {

  class BlogPostPreview extends React.Component {

    constructor(props) {
      super(props);
      this.elRef = React.createRef()
      this.data = { $page: {} }
      var reactComponent = this
      this.app = this.app || new Vue({
        data () {
          return reactComponent.data
        },
        render (h) {
          return h(BlogPostTemplate, { props: this.$data })
        }
      })
    }

    render() {
      var entry = keysToCamelCase(this.props.entry.toJS().data)
      this.data.$page = { blogPost: entry }

      return (<div ref={this.elRef}></div>)
    }

    componentDidMount() {
      this.app.$mount(this.elRef.current)
    }
  }

  CMS.registerPreviewTemplate("blogs", BlogPostPreview);

}