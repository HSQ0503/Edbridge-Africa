"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { buttonClass } from "@/components/button-link";
import { TextArea, TextField } from "@/components/form/fields";
import { DefaultValuesContext, FormContext, useFieldState } from "@/components/form/form-shell";
import {
  assessmentSections,
  otherName,
  planStatuses,
  priorityBand,
  priorityLevels,
  scoreCategories,
  type AssessmentField,
  type Answers,
} from "@/lib/assessment-form";
import type { FormState } from "@/lib/form-state";
import type { AssessmentFormState } from "./actions";

type Option = { value: string; label: string };

const inputClass =
  "block min-h-12 w-full rounded-lg border border-field bg-surface px-3 py-2.5 text-ink transition-colors duration-150 hover:border-ink aria-invalid:border-2 aria-invalid:border-danger";
const smallLabel = "block text-base font-medium";

function FieldError({ name }: { name: string }) {
  const { error } = useFieldState(name);
  if (!error) return null;
  return (
    <p id={`${name}-error`} className="mt-1 font-medium text-danger">
      <span className="sr-only">Error: </span>
      {error}
    </p>
  );
}

function asList(value: string | string[] | undefined) {
  return value === undefined ? [] : Array.isArray(value) ? value : [value];
}

// Radios and checkboxes. "Other" reveals a text box with CSS alone, and hiding it never clears what was typed.
function Choices({ field, type }: { field: Extract<AssessmentField, { kind: "radio" | "checkboxes" }>; type: "radio" | "checkbox" }) {
  const { value, error } = useFieldState(field.name);
  const selected = asList(value);
  const hintId = field.hint ? `${field.name}-hint` : undefined;
  return (
    <fieldset className="group" aria-describedby={[hintId, error && `${field.name}-error`].filter(Boolean).join(" ") || undefined}>
      <legend className="font-medium">{field.label}</legend>
      {field.hint && (
        <p id={hintId} className="mt-1 text-base text-muted">
          {field.hint}
        </p>
      )}
      <FieldError name={field.name} />
      <div className={`mt-3 grid gap-2 ${field.options.length > 6 ? "sm:grid-cols-2 sm:gap-x-6" : ""}`}>
        {field.options.map((option, index) => {
          const id = index === 0 ? field.name : `${field.name}-${index}`;
          return (
            <div key={option.value} className="flex gap-3">
              <input
                id={id}
                name={field.name}
                type={type}
                value={option.value}
                defaultChecked={selected.includes(option.value)}
                className="mt-0.5 size-6 shrink-0 cursor-pointer accent-brand"
              />
              <label htmlFor={id} className="cursor-pointer">
                {option.label}
              </label>
            </div>
          );
        })}
      </div>
      {field.other && (
        <div className="mt-3 hidden group-has-[input[value=other]:checked]:block">
          <OtherText name={otherName(field.name)} />
        </div>
      )}
    </fieldset>
  );
}

function OtherText({ name }: { name: string }) {
  const { value } = useFieldState(name);
  return (
    <>
      <label htmlFor={name} className={smallLabel}>
        Please specify
      </label>
      <FieldError name={name} />
      <input id={name} name={name} type="text" defaultValue={typeof value === "string" ? value : ""} className={`mt-1 ${inputClass}`} />
    </>
  );
}

function SmallInput({ name, label, type = "text", inputMode }: { name: string; label: string; type?: string; inputMode?: "decimal" | "numeric" }) {
  const { value, error } = useFieldState(name);
  return (
    <div>
      <label htmlFor={name} className={smallLabel}>
        {label}
      </label>
      <FieldError name={name} />
      <input
        id={name}
        name={name}
        type={type}
        inputMode={inputMode}
        defaultValue={typeof value === "string" ? value : ""}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`mt-1 ${inputClass}`}
      />
    </div>
  );
}

function SmallSelect({ name, label, options }: { name: string; label: string; options: Option[] }) {
  const { value, error } = useFieldState(name);
  return (
    <div>
      <label htmlFor={name} className={smallLabel}>
        {label}
      </label>
      <FieldError name={name} />
      <select id={name} name={name} defaultValue={typeof value === "string" ? value : ""} aria-invalid={error ? true : undefined} className={`mt-1 cursor-pointer ${inputClass}`}>
        <option value="">Choose</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Priorities({ field }: { field: Extract<AssessmentField, { kind: "priorities" }> }) {
  const { value } = useFieldState(field.name);
  const selected = asList(value);
  return (
    <fieldset>
      <legend className="font-medium">{field.label}</legend>
      <FieldError name={field.name} />
      <ul className="mt-3 divide-y divide-line border-y border-line">
        {field.areas.map((area, index) => {
          const id = index === 0 ? field.name : `${field.name}-${index}`;
          return (
            <li key={area.value} className="group py-4">
              <div className="flex gap-3">
                <input
                  id={id}
                  name={field.name}
                  type="checkbox"
                  value={area.value}
                  defaultChecked={selected.includes(area.value)}
                  className="mt-0.5 size-6 shrink-0 cursor-pointer accent-brand"
                />
                <label htmlFor={id} className="cursor-pointer font-medium">
                  {area.label}
                </label>
              </div>
              <div className="mt-3 hidden gap-4 pl-9 group-has-[input[type=checkbox]:checked]:grid sm:grid-cols-[12rem_1fr]">
                <SmallSelect name={`${field.name}.${area.value}.level`} label="Priority" options={priorityLevels} />
                <SmallInput name={`${field.name}.${area.value}.notes`} label="Notes" />
              </div>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}

// Totals update as the officer types; the server recalculates them from the saved answers.
function useLiveTotal(read: (container: HTMLElement) => number) {
  const ref = useRef<HTMLDivElement>(null);
  const [total, setTotal] = useState<number | null>(null);
  useEffect(() => {
    if (ref.current) setTotal(read(ref.current));
  }, [read]);
  const update = () => ref.current && setTotal(read(ref.current));
  return { ref, total, update };
}

const sumInputs = (selector: string) => (container: HTMLElement) =>
  [...container.querySelectorAll<HTMLInputElement>(selector)].reduce((sum, input) => {
    const value = Number(input.value.replace(/,/g, ""));
    return Number.isFinite(value) ? sum + value : sum;
  }, 0);

const sumCosts = sumInputs("input[data-cost]");
const sumScores = sumInputs("input[data-score]");

function Costs({ field }: { field: Extract<AssessmentField, { kind: "costs" }> }) {
  const { ref, total, update } = useLiveTotal(sumCosts);
  return (
    <fieldset>
      <legend className="font-medium">{field.label}</legend>
      <div ref={ref} onInput={update} className="mt-3 space-y-4">
        {field.items.map((item) => (
          <div key={item.value} className="grid gap-3 sm:grid-cols-[1fr_9rem_1fr] sm:items-end">
            <p className="font-medium sm:pb-3">{item.label}</p>
            <CostInput name={`${field.name}.${item.value}`} label={`${item.label}: cost (GHS)`} />
            <SmallInput name={`${field.name}.${item.value}.notes`} label="Notes" />
          </div>
        ))}
        <p className="border-t border-line pt-3 text-lg font-semibold" aria-live="polite">
          Total: GHS {(total ?? 0).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    </fieldset>
  );
}

function CostInput({ name, label }: { name: string; label: string }) {
  const { value, error } = useFieldState(name);
  return (
    <div>
      <label htmlFor={name} className="sr-only">
        {label}
      </label>
      <span aria-hidden="true" className="block text-base font-medium sm:hidden">
        Cost (GHS)
      </span>
      <FieldError name={name} />
      <input
        id={name}
        name={name}
        data-cost
        inputMode="decimal"
        defaultValue={typeof value === "string" ? value : ""}
        aria-invalid={error ? true : undefined}
        className={`mt-1 ${inputClass}`}
      />
    </div>
  );
}

function Scores() {
  const { ref, total, update } = useLiveTotal(sumScores);
  const band = total === null ? null : priorityBand(total);
  return (
    <div ref={ref} onInput={update} className="space-y-5">
      {scoreCategories.map((category) => (
        <ScoreRow key={category.value} category={category} />
      ))}
      <div className="border-t border-line pt-4" aria-live="polite">
        <p className="text-2xl font-semibold">
          {total ?? 0} <span className="text-lg font-normal text-muted">of 100</span>
        </p>
        {band && (
          <p className="mt-1">
            <strong>{band.label}.</strong> {band.response}.
          </p>
        )}
      </div>
    </div>
  );
}

function ScoreRow({ category }: { category: (typeof scoreCategories)[number] }) {
  const name = `score.${category.value}`;
  const { value, error } = useFieldState(name);
  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_8rem] sm:items-start">
      <div className="sm:col-span-2">
        <label htmlFor={name} className="font-medium">
          {category.label} <span className="font-normal text-muted">(0 to {category.max})</span>
        </label>
        <FieldError name={name} />
      </div>
      <input
        id={name}
        name={name}
        data-score
        type="number"
        min={0}
        max={category.max}
        inputMode="numeric"
        defaultValue={typeof value === "string" ? value : ""}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`${inputClass} sm:order-2`}
      />
      <div className="sm:order-1">
        <SmallInput name={`${name}.evidence`} label="Evidence or notes" />
      </div>
    </div>
  );
}

function Plan({ field }: { field: Extract<AssessmentField, { kind: "plan" }> }) {
  return (
    <fieldset>
      <legend className="font-medium">{field.label}</legend>
      <ol className="mt-3 space-y-4">
        {Array.from({ length: field.rows }, (_, row) => (
          <li key={row} className="rounded-xl border border-line p-4">
            <p className="font-medium">Item {row + 1}</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <SmallInput name={`${field.name}.${row}.need`} label="Identified need" />
              <SmallInput name={`${field.name}.${row}.intervention`} label="Proposed intervention" />
              <SmallInput name={`${field.name}.${row}.officer`} label="Responsible officer" />
              <SmallInput name={`${field.name}.${row}.date`} label="Target date" type="date" />
              <SmallSelect name={`${field.name}.${row}.status`} label="Status" options={planStatuses} />
            </div>
          </li>
        ))}
      </ol>
    </fieldset>
  );
}

function Field({ field }: { field: AssessmentField }) {
  switch (field.kind) {
    case "text":
      return <TextField name={field.name} label={field.label} hint={field.hint} markOptional={false} autoComplete="off" />;
    case "date":
      return <TextField name={field.name} label={field.label} hint={field.hint} type="date" markOptional={false} />;
    case "number":
      return <TextField name={field.name} label={field.label} hint={field.hint} type="number" inputMode="numeric" markOptional={false} />;
    case "textarea":
      return <TextArea name={field.name} label={field.label} hint={field.hint} rows={4} markOptional={false} />;
    case "radio":
      return <Choices field={field} type="radio" />;
    case "checkboxes":
      return <Choices field={field} type="checkbox" />;
    case "priorities":
      return <Priorities field={field} />;
    case "costs":
      return <Costs field={field} />;
    case "plan":
      return <Plan field={field} />;
    case "scores":
      return <Scores />;
  }
}

const timeFormat = new Intl.DateTimeFormat("en-GH", { timeZone: "Africa/Accra", timeStyle: "short" });

export function AssessmentForm({
  action,
  initialAnswers,
  children,
}: {
  action: (state: AssessmentFormState, formData: FormData) => Promise<AssessmentFormState>;
  initialAnswers: Answers;
  children?: React.ReactNode;
}) {
  const [state, dispatch, pending] = useActionState(action, { status: "idle" } as AssessmentFormState);
  const summaryRef = useRef<HTMLDivElement>(null);
  const formState: FormState = state.status === "error" ? state : { status: "idle" };
  const values = state.status === "error" ? state.values : state.status === "saved" ? state.values : initialAnswers;

  useEffect(() => {
    if (state.status === "error") summaryRef.current?.focus();
  }, [state]);

  // Submitting through dispatch keeps what's on screen: a plain form action would reset every field after a save.
  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget, (event.nativeEvent as SubmitEvent).submitter);
    startTransition(() => dispatch(formData));
  }

  const errors = state.status === "error" ? Object.entries(state.fieldErrors) : [];
  const sections = assessmentSections.filter((section) => section.fields.length);

  return (
    <form action={dispatch} onSubmit={onSubmit} noValidate className="space-y-8">
      {state.status === "error" && (
        <div ref={summaryRef} tabIndex={-1} className="rounded-xl border-l-4 border-danger bg-surface p-5">
          <h2 className="text-xl">{state.message}</h2>
          {errors.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-base">
              {errors.map(([name, messages]) => (
                <li key={name}>
                  <a href={`#${name}`} className="link font-medium text-danger">
                    {messages[0]}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <nav aria-label="Assessment sections" className="rounded-2xl border border-line bg-surface p-5">
        <p className="font-semibold">Sections</p>
        <ol className="mt-2 grid gap-x-6 gap-y-1 text-base sm:grid-cols-2">
          {sections.map((section) => (
            <li key={section.id}>
              <a href={`#section-${section.id}`} className="text-brand underline">
                {section.title}
              </a>
              {section.sensitive && <span className="text-muted"> (restricted)</span>}
            </li>
          ))}
        </ol>
      </nav>

      {children}

      <DefaultValuesContext value={values}>
        <FormContext value={formState}>
          {sections.map((section) => (
            <section
              key={section.id}
              id={`section-${section.id}`}
              aria-labelledby={`section-${section.id}-heading`}
              className="scroll-mt-6 space-y-6 rounded-2xl border border-line bg-surface p-5 sm:p-6"
            >
              <div>
                <h2 id={`section-${section.id}-heading`} className="text-2xl">
                  {section.title}
                </h2>
                {section.sensitive && (
                  <p className="mt-1 text-base font-semibold text-accent-text">Restricted: only staff cleared for sensitive details can see this section.</p>
                )}
                {section.description && <p className="mt-1 text-base text-muted">{section.description}</p>}
              </div>
              {section.fields.map((field) => (
                <Field key={field.name} field={field} />
              ))}
            </section>
          ))}
        </FormContext>
      </DefaultValuesContext>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line bg-paper px-4 py-4 sm:mx-0 sm:px-0">
        <button type="submit" name="intent" value="save" disabled={pending} className={buttonClass("primary", "cursor-pointer disabled:opacity-70")}>
          {pending ? "Saving…" : "Save draft"}
        </button>
        <button type="submit" name="intent" value="submit" disabled={pending} className={buttonClass("secondary", "cursor-pointer disabled:opacity-70")}>
          Submit for review
        </button>
        <p role="status" className="text-base text-muted">
          {state.status === "saved" ? `Draft saved at ${timeFormat.format(new Date(state.savedAt))}` : ""}
        </p>
      </div>
    </form>
  );
}
