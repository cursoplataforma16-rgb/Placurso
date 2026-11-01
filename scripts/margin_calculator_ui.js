(function () {
  "use strict";

  const form = document.getElementById("margin-calculator");
  if (!form || !window.PlacursoMarginCalculator) return;

  const fields = {
    unitCost: document.getElementById("unit-cost"),
    unitExpenses: document.getElementById("unit-expenses"),
    feePercent: document.getElementById("fee-percent"),
    salePrice: document.getElementById("sale-price"),
    targetMarginPercent: document.getElementById("target-margin"),
    currency: document.getElementById("currency")
  };
  const errorBox = document.getElementById("calculator-error");
  const resultBox = document.getElementById("calculator-results");

  function money(value, currency) {
    if (value === null || !Number.isFinite(value)) return "—";
    try {
      return new Intl.NumberFormat("pt-AO", {
        style: "currency",
        currency,
        maximumFractionDigits: 2
      }).format(value);
    } catch (_error) {
      return value.toFixed(2) + " " + currency;
    }
  }

  function percent(value) {
    if (value === null || !Number.isFinite(value)) return "—";
    return new Intl.NumberFormat("pt-AO", {
      maximumFractionDigits: 2
    }).format(value) + "%";
  }

  function render() {
    const result = window.PlacursoMarginCalculator.calculateMargin({
      unitCost: fields.unitCost.value,
      unitExpenses: fields.unitExpenses.value,
      feePercent: fields.feePercent.value,
      salePrice: fields.salePrice.value,
      targetMarginPercent: fields.targetMarginPercent.value
    });
    const currency = fields.currency.value || "AOA";

    if (!result.valid) {
      errorBox.textContent = result.error;
      errorBox.hidden = false;
      resultBox.hidden = true;
      return;
    }

    errorBox.textContent = "";
    errorBox.hidden = true;
    resultBox.hidden = false;

    document.getElementById("result-cost").textContent = money(result.costPerUnit, currency);
    document.getElementById("result-fee").textContent = money(result.feeAmount, currency);
    document.getElementById("result-profit").textContent = money(result.profitPerUnit, currency);
    document.getElementById("result-margin").textContent = percent(result.marginPercent);
    document.getElementById("result-markup").textContent = percent(result.markupPercent);
    document.getElementById("result-break-even").textContent = money(result.breakEvenPrice, currency);
    document.getElementById("result-target").textContent = money(result.targetPrice, currency);
  }

  form.addEventListener("input", render);
  form.addEventListener("change", render);
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    render();
  });
  render();
})();
