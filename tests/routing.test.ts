import assert from "node:assert/strict";
import { test } from "node:test";
import { inboxFor } from "../src/server/inboxes";

test("reports about the Executive Director go only to the Board Chair's inbox, whatever their type", () => {
  for (const reportType of ["safeguarding", "complaint", "misconduct", "feedback"]) {
    assert.equal(inboxFor("report", { reportType, aboutLeader: "executive" }), "about_executive");
  }
});

test("reports about the Safeguarding Lead never reach the safeguarding inbox", () => {
  assert.equal(inboxFor("report", { reportType: "safeguarding", aboutLeader: "safeguarding-lead" }), "about_safeguarding_lead");
});

test("other reports are routed by type", () => {
  assert.equal(inboxFor("report", { reportType: "safeguarding" }), "safeguarding");
  assert.equal(inboxFor("report", { reportType: "safeguarding", aboutLeader: "neither" }), "safeguarding");
  assert.equal(inboxFor("report", { reportType: "misconduct" }), "misconduct");
  assert.equal(inboxFor("report", { reportType: "feedback" }), "complaints");
});

test("contact messages are routed by topic, and job applications go to recruitment", () => {
  assert.equal(inboxFor("contact", { topic: "grants" }), "fundraising");
  assert.equal(inboxFor("contact", { topic: "partnership" }), "partnerships");
  assert.equal(inboxFor("job-application", {}), "recruitment");
});
