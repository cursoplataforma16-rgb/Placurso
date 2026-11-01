const assert = require("node:assert/strict");
const { calculateMargin } = require("./margin_calculator_core.js");

const result = calculateMargin({
  unitCost: 5000,
  unitExpenses: 500,
  feePercent: 5,
  salePrice: 8000,
  targetMarginPercent: 25
});

assert.equal(result.valid, true);
assert.equal(result.costPerUnit, 5500);
assert.equal(result.feeAmount, 400);
assert.equal(result.profitPerUnit, 2100);
assert.equal(result.marginPercent, 26.25);
assert.ok(Math.abs(result.markupPercent - 38.1818181818) < 0.000001);
assert.ok(Math.abs(result.breakEvenPrice - 5789.47368421) < 0.000001);
assert.ok(Math.abs(result.targetPrice - 7857.14285714) < 0.000001);

const noSale = calculateMargin({
  unitCost: 5000, unitExpenses: 0, feePercent: 5, salePrice: 0, targetMarginPercent: 25
});
assert.equal(noSale.valid, true);
assert.equal(noSale.profitPerUnit, null);
assert.equal(noSale.marginPercent, null);

const negativeCost = calculateMargin({
  unitCost: -1, unitExpenses: 0, feePercent: 5, salePrice: 10, targetMarginPercent: 20
});
assert.equal(negativeCost.valid, false);

const impossibleFee = calculateMargin({
  unitCost: 100, unitExpenses: 0, feePercent: 100, salePrice: 200, targetMarginPercent: 20
});
assert.equal(impossibleFee.valid, false);

const impossibleTarget = calculateMargin({
  unitCost: 100, unitExpenses: 0, feePercent: 10, salePrice: 200, targetMarginPercent: 90
});
assert.equal(impossibleTarget.valid, false);

const emptyField = calculateMargin({
  unitCost: "", unitExpenses: 0, feePercent: 5, salePrice: 200, targetMarginPercent: 20
});
assert.equal(emptyField.valid, false);

assert.equal(calculateMargin(null).valid, false);
assert.equal(calculateMargin(undefined).valid, false);

console.log("Margin calculator contract: PASS");
