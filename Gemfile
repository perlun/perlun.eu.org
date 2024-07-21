source 'https://rubygems.org'

gem 'jekyll-multiple-languages-plugin',
    github: 'perlun/jekyll-multiple-languages-plugin',
    ref: '1c149891788aa5f50cb9c469f93fa15c61a14419'
gem 'jekyll-paginate', '~> 1.1'
gem 'jekyll', '~> 3.10'
gem 'jemoji', '~> 0.13'
gem 'redcarpet', '~> 3.6'
gem 'pygments.rb', '~> 3.0'

# 1.14.0 is Ruby 2.7 only
gem 'nokogiri', '~> 1.13.10', '< 1.14.0'

# 1.17.0 does not seem to work on Ruby 2.6:
# https://github.com/perlun/perlun.eu.org/actions/runs/9685245708/job/26724904172?pr=50.
# I suspect that what we're seeing is some form of variation of this root cause:
# https://github.com/ffi/ffi/issues/1103
gem "ffi", "< 1.17.0"
