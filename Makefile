.PHONY: site

site:
	bundle exec jekyll build

serve:
	bundle exec jekyll serve

.PHONY: syntax.css
syntax.css:
# List themes: pygmentize -L style
#
# dracula: too much blood
# gruvbox-dark: looks horrible with `diff` files
# nord: pretty good, but could be even darker. Comments are hard to read.
# nord-darker: Comments still hard to read.
# one-dark: lacks colors used by the `diff` highlighter
# solarized-dark: not dark enough
#
# github-dark seems to be the best one of the default ones
	pygmentize -S github-dark -a .highlight -f html > public/css/syntax.css
