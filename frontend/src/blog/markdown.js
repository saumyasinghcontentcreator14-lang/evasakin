// src/blog/markdown.js
// Minimal, dependency-free Markdown → HTML converter, enough for blog post
// bodies written in Decap CMS's markdown editor (headings, paragraphs,
// bold/italic, links, lists). Not a full CommonMark implementation.

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inline(text) {
  let out = escapeHtml(text);
  out = out.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/\*(.+?)\*/g, "<em>$1</em>");
  out = out.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  return out;
}

export function markdownToHtml(markdown) {
  if (!markdown) return "";

  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let listBuffer = [];

  const flushList = () => {
    if (listBuffer.length) {
      html.push(`<ul>${listBuffer.map((li) => `<li>${inline(li)}</li>`).join("")}</ul>`);
      listBuffer = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushList();
      continue;
    }

    const h = /^(#{1,3})\s+(.*)$/.exec(line);
    if (h) {
      flushList();
      const level = h[1].length + 1; // # -> h2, ## -> h3, ### -> h4
      html.push(`<h${level}>${inline(h[2])}</h${level}>`);
      continue;
    }

    const li = /^[-*]\s+(.*)$/.exec(line);
    if (li) {
      listBuffer.push(li[1]);
      continue;
    }

    flushList();
    html.push(`<p>${inline(line)}</p>`);
  }
  flushList();

  return html.join("\n");
}
