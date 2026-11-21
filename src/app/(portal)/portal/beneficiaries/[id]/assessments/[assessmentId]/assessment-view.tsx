import {
  assessmentSections,
  costTotal,
  otherName,
  planStatuses,
  priorityBand,
  priorityLevels,
  scoreCategories,
  scoreTotal,
  type AssessmentField,
  type Answers,
} from "@/lib/assessment-form";
import { labelOf } from "@/lib/beneficiaries";

const ghs = (value: number) => `GHS ${value.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const text = (answers: Answers, name: string) => (typeof answers[name] === "string" ? (answers[name] as string) : "");
const list = (answers: Answers, name: string) => (Array.isArray(answers[name]) ? (answers[name] as string[]) : []);

function Missing() {
  return <span className="text-muted">Not recorded</span>;
}

function Answer({ field, answers }: { field: AssessmentField; answers: Answers }) {
  switch (field.kind) {
    case "radio": {
      const value = text(answers, field.name);
      if (!value) return <Missing />;
      const other = text(answers, otherName(field.name));
      return <>{value === "other" && other ? `Other: ${other}` : labelOf(field.options, value)}</>;
    }
    case "checkboxes": {
      const values = list(answers, field.name);
      if (!values.length) return <Missing />;
      const other = text(answers, otherName(field.name));
      return (
        <ul className="list-disc space-y-1 pl-5">
          {values.map((value) => (
            <li key={value}>{value === "other" && other ? `Other: ${other}` : labelOf(field.options, value)}</li>
          ))}
        </ul>
      );
    }
    case "priorities": {
      const values = list(answers, field.name);
      if (!values.length) return <Missing />;
      return (
        <ul className="space-y-2">
          {values.map((value) => {
            const level = labelOf(priorityLevels, text(answers, `${field.name}.${value}.level`));
            const notes = text(answers, `${field.name}.${value}.notes`);
            return (
              <li key={value}>
                <span className="font-medium">{labelOf(field.areas, value)}</span>
                {level && ` · ${level}`}
                {notes && <span className="block text-base text-muted">{notes}</span>}
              </li>
            );
          })}
        </ul>
      );
    }
    case "costs": {
      const rows = field.items.filter((item) => text(answers, `${field.name}.${item.value}`) || text(answers, `${field.name}.${item.value}.notes`));
      if (!rows.length) return <Missing />;
      return (
        <table className="w-full text-left text-base">
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="py-2 pr-4 font-semibold">Item</th>
              <th scope="col" className="py-2 pr-4 font-semibold">Cost</th>
              <th scope="col" className="py-2 font-semibold">Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => {
              const cost = text(answers, `${field.name}.${item.value}`);
              return (
                <tr key={item.value} className="border-b border-line">
                  <td className="py-2 pr-4">{item.label}</td>
                  <td className="py-2 pr-4 tabular-nums">{cost ? ghs(Number(cost)) : ""}</td>
                  <td className="py-2">{text(answers, `${field.name}.${item.value}.notes`)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" className="py-2 pr-4 font-semibold">Total</th>
              <td className="py-2 pr-4 font-semibold tabular-nums">{ghs(costTotal(answers, field.items, field.name))}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      );
    }
    case "plan": {
      const rows = Array.from({ length: field.rows }, (_, row) => row).filter((row) =>
        ["need", "intervention", "officer", "date", "status"].some((part) => text(answers, `${field.name}.${row}.${part}`)),
      );
      if (!rows.length) return <Missing />;
      return (
        <ol className="space-y-3">
          {rows.map((row) => (
            <li key={row}>
              <span className="font-medium">{text(answers, `${field.name}.${row}.need`) || "Need not stated"}</span>
              {text(answers, `${field.name}.${row}.intervention`) && ` → ${text(answers, `${field.name}.${row}.intervention`)}`}
              <span className="block text-base text-muted">
                {[
                  text(answers, `${field.name}.${row}.officer`),
                  text(answers, `${field.name}.${row}.date`) && `by ${text(answers, `${field.name}.${row}.date`)}`,
                  labelOf(planStatuses, text(answers, `${field.name}.${row}.status`)),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </li>
          ))}
        </ol>
      );
    }
    case "scores": {
      const total = scoreTotal(answers);
      return (
        <div className="space-y-2">
          <ul className="space-y-2">
            {scoreCategories.map((category) => {
              const score = text(answers, `score.${category.value}`);
              const evidence = text(answers, `score.${category.value}.evidence`);
              return (
                <li key={category.value}>
                  {category.label}:{" "}
                  <span className="font-semibold tabular-nums">
                    {score || "–"} / {category.max}
                  </span>
                  {evidence && <span className="block text-base text-muted">{evidence}</span>}
                </li>
              );
            })}
          </ul>
          <p className="border-t border-line pt-2 text-lg font-semibold">
            {total === null ? "Incomplete score" : `Total ${total} of 100 · ${priorityBand(total).label}`}
          </p>
        </div>
      );
    }
    default: {
      const value = text(answers, field.name);
      return value ? <>{value}</> : <Missing />;
    }
  }
}

export function AssessmentView({ answers, showSensitive }: { answers: Answers; showSensitive: boolean }) {
  return (
    <div className="space-y-8">
      {assessmentSections.map((section) => (
        <section key={section.id} aria-labelledby={`view-${section.id}`} className="space-y-3">
          <h2 id={`view-${section.id}`} className="text-2xl">
            {section.title}
          </h2>
          {section.sensitive && !showSensitive ? (
            <p className="rounded-2xl border border-line bg-surface p-5 text-muted">
              Restricted. Only staff cleared to see disability, health and safeguarding details can read this section.
            </p>
          ) : (
            <dl className="divide-y divide-line rounded-2xl border border-line bg-surface">
              {section.fields.map((field) => (
                <div key={field.name} className="grid gap-1 p-4 sm:grid-cols-[16rem_1fr] sm:gap-6">
                  <dt className="font-semibold">{field.label}</dt>
                  <dd className="whitespace-pre-wrap break-words">
                    <Answer field={field} answers={answers} />
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </section>
      ))}
    </div>
  );
}
