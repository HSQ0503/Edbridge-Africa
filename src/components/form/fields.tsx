"use client";

import { useFieldState } from "./form-shell";

type Option = { value: string; label: string; hint?: string };

const inputClass =
  "mt-2 block min-h-12 w-full rounded-lg border-2 border-field bg-surface px-3 py-2.5 text-ink aria-invalid:border-danger";

function describedBy(...ids: (string | false | undefined)[]) {
  return ids.filter(Boolean).join(" ") || undefined;
}

function asList(value: string | string[] | undefined) {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function Label({ htmlFor, label, required }: { htmlFor: string; label: string; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block font-semibold">
      {label}
      {!required && <span className="font-normal text-muted"> (optional)</span>}
    </label>
  );
}

function Hint({ id, children }: { id: string; children?: string }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-1 text-base text-muted">
      {children}
    </p>
  );
}

function ErrorMessage({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={id} className="mt-1 font-semibold text-danger">
      <span className="sr-only">Error: </span>
      {error}
    </p>
  );
}

type TextFieldProps = {
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  type?: "text" | "email" | "tel" | "number" | "date";
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  className?: string;
};

export function TextField({ name, label, hint, required, type = "text", autoComplete, inputMode, className = "" }: TextFieldProps) {
  const { error, value } = useFieldState(name);
  return (
    <div>
      <Label htmlFor={name} label={label} required={required} />
      <Hint id={`${name}-hint`}>{hint}</Hint>
      <ErrorMessage id={`${name}-error`} error={error} />
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        inputMode={inputMode}
        defaultValue={typeof value === "string" ? value : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(hint && `${name}-hint`, error && `${name}-error`)}
        className={`${inputClass} ${className}`}
      />
    </div>
  );
}

export function TextArea({ name, label, hint, required, rows = 5 }: { name: string; label: string; hint?: string; required?: boolean; rows?: number }) {
  const { error, value } = useFieldState(name);
  return (
    <div>
      <Label htmlFor={name} label={label} required={required} />
      <Hint id={`${name}-hint`}>{hint}</Hint>
      <ErrorMessage id={`${name}-error`} error={error} />
      <textarea
        id={name}
        name={name}
        rows={rows}
        required={required}
        defaultValue={typeof value === "string" ? value : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(hint && `${name}-hint`, error && `${name}-error`)}
        className={inputClass}
      />
    </div>
  );
}

export function SelectField({
  name,
  label,
  hint,
  required,
  options,
  defaultValue = "",
}: {
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  options: Option[];
  defaultValue?: string;
}) {
  const { error, value } = useFieldState(name);
  return (
    <div>
      <Label htmlFor={name} label={label} required={required} />
      <Hint id={`${name}-hint`}>{hint}</Hint>
      <ErrorMessage id={`${name}-error`} error={error} />
      <select
        id={name}
        name={name}
        required={required}
        defaultValue={typeof value === "string" ? value : defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(hint && `${name}-hint`, error && `${name}-error`)}
        className={`${inputClass} cursor-pointer`}
      >
        <option value="">Choose an option</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ChoiceGroup({
  type,
  name,
  legend,
  hint,
  required,
  options,
}: {
  type: "radio" | "checkbox";
  name: string;
  legend: string;
  hint?: string;
  required?: boolean;
  options: Option[];
}) {
  const { error, value } = useFieldState(name);
  const selected = asList(value);
  return (
    <fieldset aria-describedby={describedBy(hint && `${name}-hint`, error && `${name}-error`)}>
      <legend className="font-semibold">
        {legend}
        {!required && <span className="font-normal text-muted"> (optional)</span>}
      </legend>
      <Hint id={`${name}-hint`}>{hint}</Hint>
      <ErrorMessage id={`${name}-error`} error={error} />
      <div className="mt-3 space-y-2">
        {options.map((option, index) => {
          // The first option carries the bare name as its id so error-summary links land on the group.
          const id = index === 0 ? name : `${name}-${index}`;
          return (
            <div key={option.value} className="flex gap-3">
              <input
                id={id}
                name={name}
                type={type}
                value={option.value}
                required={type === "radio" ? required : undefined}
                defaultChecked={selected.includes(option.value)}
                aria-describedby={option.hint ? `${id}-hint` : undefined}
                className="mt-0.5 size-6 shrink-0 cursor-pointer accent-brand"
              />
              <label htmlFor={id} className="cursor-pointer">
                {option.label}
                {option.hint && (
                  <span id={`${id}-hint`} className="block text-base text-muted">
                    {option.hint}
                  </span>
                )}
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

export function RadioGroup(props: { name: string; legend: string; hint?: string; required?: boolean; options: Option[] }) {
  return <ChoiceGroup type="radio" {...props} />;
}

export function CheckboxGroup(props: { name: string; legend: string; hint?: string; required?: boolean; options: Option[] }) {
  return <ChoiceGroup type="checkbox" {...props} />;
}

export function Checkbox({ name, label, hint }: { name: string; label: string; hint?: string }) {
  const { error, value } = useFieldState(name);
  return (
    <div>
      <ErrorMessage id={`${name}-error`} error={error} />
      <div className="mt-1 flex gap-3">
        <input
          id={name}
          name={name}
          type="checkbox"
          value="yes"
          required
          defaultChecked={value === "yes"}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(hint && `${name}-hint`, error && `${name}-error`)}
          className="mt-0.5 size-6 shrink-0 cursor-pointer accent-brand"
        />
        <label htmlFor={name} className="cursor-pointer">
          {label}
          {hint && (
            <span id={`${name}-hint`} className="block text-base text-muted">
              {hint}
            </span>
          )}
        </label>
      </div>
    </div>
  );
}

export function FieldGroup({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-6 rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <div>
        <h3 className="text-xl font-bold">{title}</h3>
        {description && <p className="mt-1 text-base text-muted">{description}</p>}
      </div>
      {children}
    </div>
  );
}
