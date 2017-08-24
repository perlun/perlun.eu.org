[![Build Status](https://travis-ci.org/perlun/per.halleluja.nu.svg?branch=master)](https://travis-ci.org/perlun/per.halleluja.nu)

# README

This is the source code for my personal blog. You will find the blog at this URL: http://perlun.eu.org

The blog is powered by [Jekyll](http://www.jekyllrb.com), a very nice and simple static site generator. The physical hardware that powers the site is a [Raspberry PI](https://www.raspberrypi.org/), graciously donated by [my brother](https://github.com/johannesl). Thanks bro! :)

(As you can see, the site is still reasonably fast despite the limited hardware of the RPi. The main reason for this is that a Jekyll-powered site is *plain html*, i.e. no PHP/Wordpress/ASP.NET/JSP etc that needs to run on every page hit. This has naturally an extreme impact on performance vs dynamically generated pages.)

## To serve the web pages locally

```
bundle install # Assumes you have a working Ruby installation available.
bundle exec jekyll serve -w
```
