import { Check } from "lucide-react";
import type { Block, Part } from "@/content/campaigns";

function CampaignBlock({ block }: { block: Block }) {
  switch (block.type) {
    case "text":
      return (
        <div className="max-w-[70ch] space-y-4 text-lg">
          {block.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      );
    case "list":
      if (block.numbered) {
        return (
          <ol className="max-w-3xl space-y-3">
            {block.items.map((item, index) => (
              <li key={item} className="flex gap-3">
                <span aria-hidden="true" className="w-6 shrink-0 text-right font-medium tabular-nums text-brand">
                  {index + 1}.
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        );
      }
      return (
        <ul className="grid max-w-5xl gap-x-8 gap-y-3 sm:grid-cols-2">
          {block.items.map((item) => (
            <li key={item} className="flex gap-3">
              <Check aria-hidden="true" className="mt-1 size-5 shrink-0 text-brand" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "table":
      return (
        <div className="max-w-2xl overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full text-left text-base">
            <caption className="sr-only">{block.caption}</caption>
            <thead>
              <tr>
                {block.columns.map((column, index) => (
                  <th
                    key={column}
                    scope="col"
                    className={`px-4 py-3 text-label font-medium text-muted sm:px-6 ${index > 0 ? "text-right" : ""}`}
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map(([item, ...values]) => (
                <tr key={item} className="border-t border-line">
                  <th scope="row" className="px-4 py-3 font-normal [overflow-wrap:anywhere] sm:px-6">
                    {item}
                  </th>
                  {values.map((value, index) => (
                    <td key={index} className="px-4 py-3 text-right font-medium tabular-nums sm:px-6">
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "terms":
      return (
        <dl className="grid max-w-5xl gap-x-8 gap-y-6 sm:grid-cols-2">
          {block.items.map(({ term, text }) => (
            <div key={term} className="border-t border-line pt-4">
              <dt className="font-medium">{term}</dt>
              <dd className="mt-1 text-base text-muted">{text}</dd>
            </div>
          ))}
        </dl>
      );
    case "callout":
      return (
        <p className="max-w-[70ch] rounded-xl bg-brand-tint px-5 py-4 text-base">
          <span className="font-medium text-brand">{block.term}:</span> {block.text}
        </p>
      );
    case "subheading":
      return <h4 className="pt-2 text-xl">{block.text}</h4>;
  }
}

export function CampaignBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, index) => (
        <CampaignBlock key={index} block={block} />
      ))}
    </div>
  );
}

// Long sections read as a column of headings beside their content on wide screens.
export function CampaignParts({ parts }: { parts: Part[] }) {
  return (
    <div className="divide-y divide-line border-t border-line">
      {parts.map((part) => (
        <div key={part.heading} className="grid gap-4 py-8 lg:grid-cols-[1fr_2.2fr] lg:gap-10">
          <h3 className="text-2xl">{part.heading}</h3>
          {/* min-w-0 lets a wide table scroll inside its column instead of widening the page on phones. */}
          <div className="min-w-0">
            <CampaignBlocks blocks={part.blocks} />
          </div>
        </div>
      ))}
    </div>
  );
}
