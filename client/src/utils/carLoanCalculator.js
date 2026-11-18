export const CAR_LOAN_SEO = {
  title: "Car Loan Calculator Pakistan – Calculate Monthly Instalments | Sello",
  description: "Calculate your monthly car instalments in Pakistan with SELLO’s free car loan calculator. Estimate down payment, financing amount, markup and total repayment.",
  canonical: "https://sello.pk/car-loan-calculator",
};

export const DISCLAIMER =
  "This calculator provides estimated car financing instalments for informational purposes only. Actual financing rates, monthly payments, fees, insurance and eligibility are determined by the respective bank or financial institution. Please confirm all terms directly with the provider before applying.";

const defaults = {
  price: "4000000",
  down: "30",
  downUnit: "percent",
  years: "3",
  rate: "15",
  fee: "0",
  insurance: "0",
  kind: "conventional",
  rental: "",
  finalPayment: "0",
};

const moneyLimit = 1000000000;
const number = (value) =>
  typeof value === "string" && /^(?:\d+\.?\d*|\.\d+)$/.test(value.trim())
    ? Number(value)
    : NaN;

export function readScenario(search) {
  const params = new URLSearchParams(search);
  return Object.fromEntries(
    Object.entries(defaults).map(([field, fallback]) => {
      const value = params.get(field);
      return [field, value !== null && value.length <= 20 ? value : fallback];
    }),
  );
}

export function paymentFactor(rate, months) {
  const monthlyRate = rate / 1200;
  return monthlyRate === 0
    ? 1 / months
    : monthlyRate / -Math.expm1(-months * Math.log1p(monthlyRate));
}

export function calculateScenario(values) {
  const islamic = values.kind === "islamic";
  const price = number(values.price);
  const down = number(values.down);
  const years = number(values.years);
  const rate = number(values.rate);
  const fee = number(values.fee || "0");
  const insurance = number(values.insurance || "0");
  const rental = number(values.rental);
  const finalPayment = islamic ? number(values.finalPayment || "0") : 0;
  const downPayment = values.downUnit === "percent" ? price * down / 100 : down;
  const errors = {};

  if (!(price > 0 && price <= moneyLimit)) errors.price = "Enter a vehicle price up to PKR 1 billion.";
  if (!(down >= 0 && downPayment <= price)) errors.down = "Enter a down payment between zero and the car price.";
  if (![1, 2, 3, 4, 5].includes(years)) errors.years = "Select a tenure from 1 to 5 years.";
  if (!islamic && !(rate >= 0 && rate <= 100)) errors.rate = "Enter an annual markup from 0% to 100%.";
  if (!(fee >= 0 && fee <= moneyLimit)) errors.fee = "Enter a processing fee up to PKR 1 billion.";
  if (!(insurance >= 0 && insurance <= moneyLimit)) errors.insurance = "Enter an upfront cost up to PKR 1 billion.";
  if (islamic && !(rental > 0 && rental <= moneyLimit)) errors.rental = "Enter the monthly amount from your provider’s quote.";
  if (!(finalPayment >= 0 && finalPayment <= moneyLimit)) errors.finalPayment = "Enter a final payment up to PKR 1 billion.";

  if (Object.keys(errors).length) return { errors, result: null };

  const months = years * 12;
  const principal = price - downPayment;
  const monthly = islamic ? rental : principal * paymentFactor(rate, months);
  const repayment = monthly * months + finalPayment;
  const charges = fee + insurance;
  return {
    errors,
    result: {
      months, price, downPayment, principal, monthly, repayment, charges,
      markup: islamic ? null : Math.max(0, repayment - principal),
      initial: downPayment + charges,
      total: downPayment + charges + repayment,
    },
  };
}

export function calculateBudget(income, expenses, reserve) {
  const values = [income, expenses || "0", reserve || "0"].map(number);
  if (!values.every((value) => Number.isFinite(value) && value <= moneyLimit)) return null;
  return Math.max(0, values[0] - values[1] - values[2]);
}
