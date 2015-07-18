module Jekyll
  # Inspired by http://stackoverflow.com/a/17206081/227779
  class PermalinkRewriter < Generator
    safe true
    priority :low

    def generate(site)
      site.posts.each do |item|
        item.data['permalink'] = '/' + [
          ascii_sanitize(item.categories.join('/')),
          item.date.year,
          item.date.month,
          item.date.day,
          item.slug
        ].join('/')
      end
    end

    def ascii_sanitize(s)
      result = s.dup
      result.gsub! /å/, 'a'
      result.gsub! /ä/, 'a'
      result.gsub! /ö/, 'o'
      result.gsub! ' ', '-'
      result
    end
  end
end
