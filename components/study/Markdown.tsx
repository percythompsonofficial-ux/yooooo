import { Fragment, type ReactNode } from "react";

/**
 * A small markdown renderer for generated notes.
 *
 * Deliberately renders React elements rather than setting innerHTML: the
 * notes are model output derived from a transcript the user pasted, so
 * injecting them as HTML would make a lecture transcript an XSS vector. This
 * covers what the notes prompt actually asks for — headings, paragraphs,
 * lists, blockquotes, and inline emphasis or code — and shows anything else
 * as plain text.
 */

function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  // `code` | **bold** | *italic* or _italic_
  const re = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(_[^_]+_)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    const key = `${keyBase}-${i++}`;
    if (tok.startsWith("`")) {
      out.push(
        <code key={key} className="rounded bg-stone-100 px-1 py-0.5 font-mono text-[0.85em]">
          {tok.slice(1, -1)}
        </code>,
      );
    } else if (tok.startsWith("**")) {
      out.push(<strong key={key} className="font-semibold">{tok.slice(2, -2)}</strong>);
    } else {
      out.push(<em key={key}>{tok.slice(1, -1)}</em>);
    }
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

type Block =
  | { type: "h"; level: 2 | 3 | 4; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "quote"; text: string };

function parse(md: string): Block[] {
  const blocks: Block[] = [];
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  let para: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushPara = () => {
    if (para.length) {
      blocks.push({ type: "p", text: para.join(" ").trim() });
      para = [];
    }
  };
  const flushList = () => {
    if (list) {
      blocks.push(list.ordered ? { type: "ol", items: list.items } : { type: "ul", items: list.items });
      list = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (!line.trim()) {
      flushPara();
      flushList();
      continue;
    }

    const heading = /^(#{2,4})\s+(.*)$/.exec(line);
    if (heading) {
      flushPara();
      flushList();
      blocks.push({
        type: "h",
        level: heading[1].length as 2 | 3 | 4,
        text: heading[2].trim(),
      });
      continue;
    }

    const bullet = /^\s*[-*+]\s+(.*)$/.exec(line);
    if (bullet) {
      flushPara();
      if (!list || list.ordered) { flushList(); list = { ordered: false, items: [] }; }
      list.items.push(bullet[1]);
      continue;
    }

    const numbered = /^\s*\d+[.)]\s+(.*)$/.exec(line);
    if (numbered) {
      flushPara();
      if (!list || !list.ordered) { flushList(); list = { ordered: true, items: [] }; }
      list.items.push(numbered[1]);
      continue;
    }

    const quote = /^>\s?(.*)$/.exec(line);
    if (quote) {
      flushPara();
      flushList();
      blocks.push({ type: "quote", text: quote[1] });
      continue;
    }

    flushList();
    para.push(line.trim());
  }
  flushPara();
  flushList();
  return blocks;
}

export function Markdown({ source }: { source: string }) {
  const blocks = parse(source);

  return (
    <div className="flex flex-col gap-4">
      {blocks.map((b, i) => {
        const key = `b${i}`;
        switch (b.type) {
          case "h": {
            const cls =
              b.level === 2
                ? "mt-4 text-lg font-semibold tracking-tight text-stone-900"
                : b.level === 3
                  ? "mt-2 text-base font-semibold text-stone-900"
                  : "mt-1 text-sm font-semibold uppercase tracking-wide text-stone-500";
            const H = `h${b.level}` as const;
            return <H key={key} className={cls}>{inline(b.text, key)}</H>;
          }
          case "p":
            return (
              <p key={key} className="text-[15px] leading-relaxed text-stone-700">
                {inline(b.text, key)}
              </p>
            );
          case "ul":
            return (
              <ul key={key} className="ml-5 flex list-disc flex-col gap-1.5 text-[15px] leading-relaxed text-stone-700 marker:text-stone-400">
                {b.items.map((it, j) => (
                  <li key={j}>{inline(it, `${key}-${j}`)}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={key} className="ml-5 flex list-decimal flex-col gap-1.5 text-[15px] leading-relaxed text-stone-700 marker:text-stone-400">
                {b.items.map((it, j) => (
                  <li key={j}>{inline(it, `${key}-${j}`)}</li>
                ))}
              </ol>
            );
          case "quote":
            return (
              <blockquote key={key} className="border-l-2 border-stone-300 pl-3 text-[15px] italic text-stone-600">
                {inline(b.text, key)}
              </blockquote>
            );
          default:
            return <Fragment key={key} />;
        }
      })}
    </div>
  );
}
