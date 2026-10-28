import assert from "node:assert/strict";
import { test } from "node:test";
import type { CollectionBeforeChangeHook } from "payload";
import { enforceWorkflow, hasWebConsent } from "../src/cms/workflow";

type HookArgs = Parameters<CollectionBeforeChangeHook>[0];
type Role = "writer" | "publisher" | "safeguarding_reviewer";
type Doc = Record<string, unknown>;

const consentedChild = { id: 7, alt: "A pupil reading", identifiableChild: true, consentScopes: ["web"], consentExpires: "2099-01-01" };
const unconsentedChild = { id: 8, alt: "A pupil", identifiableChild: true, consentScopes: ["print"], consentExpires: "2099-01-01" };

function save(roles: Role[], data: Doc, originalDoc?: Doc, media: Doc = consentedChild) {
  const req = { user: { roles }, payload: { findByID: async () => media } };
  return enforceWorkflow(["image"])({ data: { ...data }, originalDoc, req, context: {}, operation: originalDoc ? "update" : "create" } as unknown as HookArgs);
}

const story = { title: "Back to school", summary: "Ama returns to class", image: 7 };

test("only publishers can approve or publish", async () => {
  await assert.rejects(save(["writer"], { ...story, reviewState: "approved" }, { ...story, reviewState: "in_review" }), /Only a publisher/);
  await assert.rejects(save(["writer"], { ...story, reviewState: "in_review", _status: "published" }), /Only a publisher can publish/);
  await assert.rejects(save(["publisher"], { ...story, reviewState: "in_review", _status: "published" }), /Approved before publishing/);
  const published = await save(["publisher"], { ...story, reviewState: "approved", _status: "published" });
  assert.equal(published._status, "published");
});

test("a writer's edit sends approved content back to draft", async () => {
  const saved = await save(["writer"], { ...story, title: "Edited", reviewState: "approved" }, { ...story, reviewState: "approved" });
  assert.equal(saved.reviewState, "draft");
});

test("content featuring a child needs safeguarding approval of the exact version published", async () => {
  const draft = { ...story, featuresChild: true, reviewState: "in_review" };
  await assert.rejects(save(["writer"], { ...draft, safeguardingApproved: true }, draft), /safeguarding reviewer/);

  const approved = await save(["safeguarding_reviewer"], { ...draft, safeguardingApproved: true }, draft);
  assert.equal(approved.safeguardingApproved, true);

  const publish = { ...approved, reviewState: "approved", _status: "published" };
  assert.equal((await save(["publisher"], publish, approved))._status, "published");

  // The writer changes the story after approval: the approval lapses and publishing is blocked.
  const edited = await save(["writer"], { ...approved, summary: "Changed" }, approved);
  assert.equal(edited.safeguardingApproved, false);
  await assert.rejects(save(["publisher"], { ...edited, reviewState: "approved", _status: "published" }, edited), /features a child/);
});

test("an image of an identifiable child without website consent blocks publishing", async () => {
  await assert.rejects(
    save(["publisher"], { ...story, image: 8, reviewState: "approved", _status: "published" }, undefined, unconsentedChild),
    /without current consent/,
  );
});

test("website consent must cover the web and still be current", () => {
  assert.equal(hasWebConsent({ identifiableChild: false }), true);
  assert.equal(hasWebConsent(consentedChild), true);
  assert.equal(hasWebConsent(unconsentedChild), false);
  assert.equal(hasWebConsent({ ...consentedChild, consentExpires: "2020-01-01" }), false);
});
