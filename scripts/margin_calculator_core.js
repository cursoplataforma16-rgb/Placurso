(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.PlacursoMarginCalculator = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function calculateMargin(input) {
    const values = {
      unitCost: Number(input.unitCost),
      unitExpenses: Number(input.unitExpenses),
      feePercent: Number(input.feePercent),
      salePrice: Number(input.salePrice),
      targetMarginPercent: Number(input.targetMarginPercent)
    };

    const allFinite = Object.values(values).every(Number.isFinite);
    if (!allFinite) {
      return { valid: false, error: "Preencha todos os campos com números válidos." };
    }
    if (values.unitCost < 0 || values.unitExpenses < 0 || values.salePrice < 0) {
      return { valid: false, error: "Os custos e o preço não podem ser negativos." };
    }
    if (values.feePercent < 0 || values.feePercent >= 100) {
      return { valid: false, error: "A taxa percentual deve ficar entre 0% e menos de 100%." };
    }
    if (values.targetMarginPercent < 0 || values.targetMarginPercent >= 100) {
      return { valid: false, error: "A margem pretendida deve ficar entre 0% e menos de 100%." };
    }

    const feeRate = values.feePercent / 100;
    const targetRate = values.targetMarginPercent / 100;
    if (feeRate + targetRate >= 1) {
      return {
        valid: false,
        error: "A soma da taxa e da margem pretendida tem de ser inferior a 100%."
      };
    }

    const costPerUnit = values.unitCost + values.unitExpenses;
    const feeAmount = values.salePrice * feeRate;
    const profitPerUnit = values.salePrice > 0
      ? values.salePrice - feeAmount - costPerUnit
      : null;
    const marginPercent = values.salePrice > 0
      ? (profitPerUnit / values.salePrice) * 100
      : null;
    const markupPercent = values.salePrice > 0 && costPerUnit > 0
      ? (profitPerUnit / costPerUnit) * 100
      : null;
    const breakEvenPrice = costPerUnit / (1 - feeRate);
    const targetPrice = costPerUnit / (1 - feeRate - targetRate);

    return {
      valid: true,
      costPerUnit,
      feeAmount,
      profitPerUnit,
      marginPercent,
      markupPercent,
      breakEvenPrice,
      targetPrice
    };
  }

  return { calculateMargin };
});
