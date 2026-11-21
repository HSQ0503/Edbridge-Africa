import assert from "node:assert/strict";
import { test } from "node:test";
import { parseAssessment, priorityBand, scoreTotal } from "../src/lib/assessment-form";
import { ageOn, beneficiaryCode, householdCode } from "../src/lib/beneficiaries";
import { can } from "../src/server/beneficiaries/permissions";

function form(entries: [string, string][]) {
  const data = new FormData();
  for (const [name, value] of entries) data.append(name, value);
  return data;
}

test("multi-select answers keep every ticked option", () => {
  const { answers, errors } = parseAssessment(
    form([
      ["disruptionReasons", "fees"],
      ["disruptionReasons", "materials"],
      ["disruptionReasons", "disability"],
      ["disruptionReasons", "other"],
      ["disruptionReasons.other", "Helps at the family stall"],
    ]),
    { submitting: false },
  );
  assert.deepEqual(errors, {});
  assert.deepEqual(answers.disruptionReasons, ["fees", "materials", "disability", "other"]);
  assert.equal(answers["disruptionReasons.other"], "Helps at the family stall");
});

test("exclusive options can't be combined, unknown options and fields are rejected or dropped", () => {
  const { answers, errors } = parseAssessment(
    form([
      ["safeguardingConcerns", "none"],
      ["safeguardingConcerns", "neglect"],
      ["academicNeeds", "flying"],
      ["notAField", "x"],
    ]),
    { submitting: false },
  );
  assert.ok(errors.safeguardingConcerns);
  assert.ok(errors.academicNeeds);
  assert.equal(answers.notAField, undefined);
});

test("drafts need nothing; submitting needs the decision and a full score within each maximum", () => {
  assert.deepEqual(parseAssessment(form([]), { submitting: false }).errors, {});
  const submitted = parseAssessment(form([["score.support", "6"]]), { submitting: true }).errors;
  assert.ok(submitted.educationStatus && submitted.recommendation && submitted.recommendationReason);
  assert.match(submitted["score.support"][0], /0 to 5/);
});

test("scores total to 100 and map to Appendix A's bands", () => {
  const answers = { "score.economic": "20", "score.educational": "25", "score.family": "15", "score.disability": "15", "score.welfare": "10", "score.dropout": "10", "score.support": "5" };
  assert.equal(scoreTotal(answers), 100);
  assert.equal(scoreTotal({ ...answers, "score.support": "" }), null);
  assert.equal(priorityBand(80).value, "critical");
  assert.equal(priorityBand(79).value, "high");
  assert.equal(priorityBand(45).value, "moderate");
  assert.equal(priorityBand(44).value, "lower");
});

test("ages count whole years, and IDs carry no personal details", () => {
  const born = new Date("2013-03-14T00:00:00Z");
  assert.equal(ageOn(born, new Date("2026-03-13T12:00:00Z")), 12);
  assert.equal(ageOn(born, new Date("2026-03-14T00:00:00Z")), 13);
  assert.equal(beneficiaryCode("Volta", new Date("2026-11-21T00:00:00Z"), 42), "EBA-VR-26-00042");
  assert.equal(householdCode(7), "HH-00007");
});

test("roles grant only what they list", () => {
  assert.equal(can({ beneficiaryRoles: [] }, "view"), false);
  assert.equal(can({ beneficiaryRoles: ["reports"] }, "view"), false);
  assert.equal(can({ beneficiaryRoles: ["reports"] }, "viewReports"), true);
  assert.equal(can({ beneficiaryRoles: ["sensitive"] }, "view"), false);
  assert.equal(can({ beneficiaryRoles: ["registrar"] }, "assess"), false);
  assert.equal(can({ beneficiaryRoles: ["assessor"] }, "decide"), false);
  assert.equal(can({ beneficiaryRoles: ["assessor"] }, "viewSensitive"), false);
  assert.equal(can({ beneficiaryRoles: ["approver"] }, "approveAssistance"), true);
});
