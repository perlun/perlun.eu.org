module Jekyll
  # Inspired by http://stackoverflow.com/a/17206081/227779
  class PermalinkRewriter < Generator
    safe true
    priority :low

    def generate(site)
      site.posts.each do |item|
        item.data['permalink'] = '/' + [
          item.categories,
          item.date.year,
          item.date.month,
          item.date.day,
          item.slug
        ].join('/')
      end
    end
  end
end
