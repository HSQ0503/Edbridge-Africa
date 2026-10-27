// Turns an option list into the non-empty tuple z.enum() needs, so labels and validation can't drift apart.
export function valuesOf<T extends readonly { value: string }[]>(options: T) {
  return options.map((option) => option.value) as unknown as [T[number]["value"], ...T[number]["value"][]];
}
