import { SelectField, TextArea, TextField } from "@/components/form/fields";
import { FormShell } from "@/components/form/form-shell";
import { submitContact } from "./actions";
import { contactTopics, type ContactTopic } from "./options";

export function ContactForm({ defaultTopic }: { defaultTopic?: ContactTopic }) {
  return (
    <FormShell
      action={submitContact}
      submitLabel="Send message"
      successTitle="Thank you — your message has been sent"
      successMessage="A member of our team will get back to you as soon as we can."
    >
      <TextField name="fullName" label="Your name" required autoComplete="name" />
      <TextField name="email" label="Email address" type="email" required autoComplete="email" />
      <TextField
        name="phone"
        label="Phone number"
        type="tel"
        autoComplete="tel"
        hint="Include the country code if you are outside Ghana"
      />
      <TextField name="organisation" label="Organisation" autoComplete="organization" />
      <SelectField
        name="topic"
        label="What is your message about?"
        required
        options={contactTopics}
        defaultValue={defaultTopic}
      />
      <TextArea name="message" label="Your message" required rows={6} />
    </FormShell>
  );
}
