import re
from html import unescape

BLOCK_DANGEROUS_TAGS = {"script", "style", "iframe", "object", "embed", "applet", "noscript"}
STRIP_DANGEROUS_TAGS = {"form", "input", "link", "meta", "base"}
ALLOWED_TAGS = {
    "p", "br", "div", "span", "h1", "h2", "h3", "h4", "h5", "h6",
    "strong", "em", "b", "i", "u", "s", "a", "img", "ul", "ol", "li",
    "table", "thead", "tbody", "tr", "td", "th", "blockquote", "pre", "code", "hr",
    "sub", "sup", "del", "ins",
}

_block_pattern = re.compile(
    r'<(' + '|'.join(BLOCK_DANGEROUS_TAGS) + r')\b[^>]*>.*?</\1\s*>',
    re.IGNORECASE | re.DOTALL
)
_tag_pattern = re.compile(r'</?(\w+)[^>]*>', re.IGNORECASE)
_event_handler_pattern = re.compile(r'\s+on\w+\s*=\s*(?:"[^"]*"|\'[^\']*\'|[^\s>]*)', re.IGNORECASE)
_javascript_pattern = re.compile(r'javascript\s*:', re.IGNORECASE)


def sanitize_html(html: str | None) -> str:
    if not html:
        return ""

    cleaned = _block_pattern.sub("", html)
    cleaned = _event_handler_pattern.sub("", cleaned)
    cleaned = _javascript_pattern.sub("", cleaned)

    def _replace_tag(match):
        tag = match.group(1).lower()
        if tag in STRIP_DANGEROUS_TAGS:
            return ""
        if tag in ALLOWED_TAGS:
            if match.group(0).startswith("</"):
                return f"</{tag}>"
            return match.group(0)
        return ""

    cleaned = _tag_pattern.sub(_replace_tag, cleaned)
    return cleaned
