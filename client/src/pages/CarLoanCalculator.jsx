import { useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowUpRight,
  Calculator,
  ChevronRight,
  Copy,
  Download,
  Plus,
  X,
} from "lucide-react";
import { useGetSingleCarQuery } from "../redux/services/api";
import { extractCarIdFromSlug } from "../utils/urlBuilders";
import {
  calculateBudget,
  calculateScenario,
  DISCLAIMER,
  paymentFactor,
  readScenario,
} from "../utils/carLoanCalculator";

const money = new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 });
const pkr = (value) => `PKR ${money.format(value)}`;
const panel = "min-w-0 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7";
const button =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45";
const fieldClass =
  "min-h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500";
const primary =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-bold text-[#0A1025] hover:bg-primary-600";

const banks = [
  {
    name: "Meezan Bank",
    product: "Car Ijarah",
    type: "Islamic · Ijarah",
    link: "https://www.meezanbank.com/car-ijarah/",
    terms:
      "Regular Car Ijarah runs 1–5 years. Used Car Ijarah lists a security deposit starting at 30%. Ask for a rental quote.",
  },
  {
    name: "HBL",
    product: "HBL CarLoan",
    type: "Conventional",
    link: "https://www.hbl.com/carloan",
    terms:
      "Ask HBL for its current key fact statement and written quote. Current rates and fees were unavailable for verification.",
  },
  {
    name: "Bank Alfalah",
    product: "Auto Loan",
    type: "Conventional",
    link: "https://www.bankalfalah.com/personal-banking/loans/auto-loan/",
    terms:
      "Published floating markup for locally assembled vehicles is 1-year KIBOR + 3.50% to 4.50%, depending on tenor. The listed 4–5 year term is for vehicles up to 1,000 cc.",
  },
  {
    name: "UBL",
    product: "UBL Drive",
    type: "Conventional",
    link: "https://ubldigital.com/Loans/Consumer-Loans/UBL-Drive",
    terms:
      "Publishes financing up to 70% of vehicle value, from PKR 250,000 to PKR 3 million. Fixed and floating rates vary by customer relationship.",
  },
  {
    name: "Faysal Bank",
    product: "Faysal Islami Car Finance",
    type: "Islamic · Diminishing Musharakah",
    link: "https://www.faysalbank.com/car-finance/faysal-islami-car-finance",
    terms:
      "Publishes at least 30% initial equity, a PKR 3 million maximum and a PKR 12,000 processing fee after approval. Ask for a payment quote.",
  },
  {
    name: "MCB Bank",
    product: "Car4U",
    type: "Conventional",
    link: "https://www.mcb.com.pk/personal/consumer-loans/consumer-loans/car4u",
    terms:
      "Publishes up to 70% financing and comprehensive insurance. Standard floating markup is 1-year KIBOR + 4% for account holders or + 4.50% for new-to-bank customers.",
  },
];

function AmountField({
  id,
  label,
  value,
  onChange,
  error,
  suffix = "PKR",
  optional = false,
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="number"
          min="0"
          step="any"
          inputMode="decimal"
          className={`${fieldClass} pr-14`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={optional ? "0" : undefined}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-medium text-slate-500"
        >
          {suffix}
        </span>
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

function resultRows(result) {
  return [
    ["Car price", result.price],
    ["Down payment", result.downPayment],
    [
      result.markup === null
        ? "Price less upfront contribution"
        : "Financing amount",
      result.principal,
    ],
    ...(result.markup === null ? [] : [["Total markup", result.markup]]),
    ["Total repayment", result.repayment],
    ["Estimated additional charges", result.charges],
    ["Total initial payment", result.initial],
    ["Total paid including upfront costs", result.total],
  ];
}

function ListingPrice({ onApply }) {
  const [url, setUrl] = useState("");
  const [carId, setCarId] = useState("");
  const [invalid, setInvalid] = useState(false);
  const { currentData: car, isFetching } = useGetSingleCarQuery(carId, {
    skip: !carId,
  });
  const price = Number(car?.price);
  return (
    <details className="mt-6 border-t border-slate-200 pt-4">
      <summary className="cursor-pointer text-sm font-semibold">
        Use a SELLO listing price
      </summary>
      <form
        className="mt-3 flex flex-wrap gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const match = url
            .trim()
            .match(
              /^(?:https?:\/\/(?:www\.)?sello\.pk)?\/(?:cars|car-details)\/([^/?#]+)/i,
            );
          const id = match ? extractCarIdFromSlug(match[1]) : "";
          setCarId(id || "");
          setInvalid(!id);
        }}
      >
        <input
          aria-label="SELLO listing URL"
          className={`${fieldClass} flex-1 basis-48`}
          value={url}
          onChange={(event) => {
            setUrl(event.target.value);
            setCarId("");
            setInvalid(false);
          }}
          placeholder="Paste a SELLO listing link"
        />
        <button className={button} type="submit">
          Find listing
        </button>
      </form>
      {invalid && (
        <p role="status" className="mt-2 text-sm">
          Enter a valid SELLO car listing link.
        </p>
      )}
      {carId &&
        (isFetching ? (
          <p role="status" className="mt-2 text-sm">
            Looking up listing…
          </p>
        ) : Number.isFinite(price) && price > 0 ? (
          <button
            type="button"
            className={`${button} mt-2`}
            onClick={() => onApply(String(price))}
          >
            Use {pkr(price)}
          </button>
        ) : (
          <p role="status" className="mt-2 text-sm">
            A listing price could not be loaded.
          </p>
        ))}
    </details>
  );
}

export default function CarLoanCalculator() {
  const { search } = useLocation();
  const [values, setValues] = useState(() => readScenario(search));
  const [scenarios, setScenarios] = useState([]);
  const nextScenarioId = useRef(0);
  const [notice, setNotice] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [budget, setBudget] = useState({
    income: "",
    expenses: "",
    reserve: "",
  });
  const { errors, result } = calculateScenario(values);
  const islamic = values.kind === "islamic";
  const percentageDown = values.downUnit === "percent";
  const sliderDown = Math.min(
    100,
    Math.max(0, Math.round(Number(values.down) || 0)),
  );
  const available = calculateBudget(
    budget.income,
    budget.expenses,
    budget.reserve,
  );
  const factor =
    result && !islamic
      ? paymentFactor(Number(values.rate), result.months)
      : null;
  const affordablePrincipal =
    factor && available !== null ? available / factor : null;
  const affordablePrice =
    affordablePrincipal === null
      ? null
      : values.downUnit === "percent"
        ? Number(values.down) < 100
          ? affordablePrincipal / (1 - Number(values.down) / 100)
          : null
        : affordablePrincipal + Number(values.down);

  const update = (key, value) => {
    setValues((previous) => ({ ...previous, [key]: value }));
    setNotice("");
    setShareUrl("");
  };
  const amount = (key, label, options = {}) => (
    <AmountField
      id={`loan-${key}`}
      label={label}
      value={values[key]}
      onChange={(value) => update(key, value)}
      error={errors[key]}
      {...options}
    />
  );
  const getLink = () => {
    const shared = new URL("/car-loan-calculator", window.location.origin);
    const { rental, finalPayment, rate, ...common } = values;
    shared.search = new URLSearchParams({
      ...common,
      ...(islamic ? { rental, finalPayment } : { rate }),
    }).toString();
    return shared.href;
  };
  const copyLink = async () => {
    const link = getLink();
    try {
      await navigator.clipboard.writeText(link);
      setNotice("Calculation link copied.");
    } catch {
      setShareUrl(link);
      setNotice("Copy the calculation link below.");
    }
  };
  const download = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      doc.setFontSize(19);
      doc.text("SELLO Car Financing Estimate", 18, 24);
      doc.setFontSize(11);
      doc.text(
        `${islamic ? "Islamic provider quote" : "Conventional reducing-balance financing"} | ${result.months} months`,
        18,
        36,
      );
      const rows = [["Monthly payment", result.monthly], ...resultRows(result)];
      rows.forEach(([label, value], index) => {
        doc.text(label, 18, 51 + index * 9);
        doc.text(pkr(value), 192, 51 + index * 9, { align: "right" });
      });
      doc.text(doc.splitTextToSize(DISCLAIMER, 174), 18, 149);
      doc.save("sello-car-financing-estimate.pdf");
    } catch {
      setNotice("The PDF could not be downloaded. Please try again.");
    }
  };

  return (
    <div className="bg-[#F6F7F9] text-[#0A1025]">
      <header className="bg-[#0A1025] text-white">
        <div className="mx-auto max-w-6xl px-4 py-9 sm:px-6 sm:py-14 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-sm text-slate-300"
          >
            <Link to="/" className="hover:underline">
              Home
            </Link>
            <ChevronRight aria-hidden="true" className="h-4 w-4" />
            <span aria-current="page">Car Loan Calculator</span>
          </nav>
          <h1 className="mt-5 max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl">
            Car Loan Calculator Pakistan
          </h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            Estimate your monthly car instalment, compare financing scenarios,
            and see how much you would pay upfront.
          </p>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid items-start gap-6 lg:grid-cols-[1.15fr_1fr]">
          <section className={panel} aria-labelledby="loan-inputs">
            <h2
              id="loan-inputs"
              className="flex items-center gap-2 text-xl font-bold"
            >
              <Calculator aria-hidden="true" className="h-5 w-5" /> Financing
              details
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Starting values are examples. Use the terms in your own quote.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="loan-kind"
                  className="mb-1.5 block text-sm font-semibold"
                >
                  Financing type
                </label>
                <select
                  id="loan-kind"
                  className={fieldClass}
                  value={islamic ? "islamic" : "conventional"}
                  onChange={(event) => update("kind", event.target.value)}
                >
                  <option value="conventional">Conventional financing</option>
                  <option value="islamic">Islamic financing</option>
                </select>
              </div>
              {amount("price", "Car price")}
              <div>
                <label
                  htmlFor="loan-years"
                  className="mb-1.5 block text-sm font-semibold"
                >
                  Financing tenure
                </label>
                <select
                  id="loan-years"
                  className={fieldClass}
                  value={values.years}
                  aria-invalid={!!errors.years}
                  onChange={(event) => update("years", event.target.value)}
                >
                  {[1, 2, 3, 4, 5].map((year) => (
                    <option key={year} value={year}>
                      {year} {year === 1 ? "year" : "years"}
                    </option>
                  ))}
                </select>
                {errors.years && (
                  <p className="mt-1 text-sm text-red-700">{errors.years}</p>
                )}
              </div>
              {amount("down", "Down payment", {
                suffix: percentageDown ? "%" : "PKR",
              })}
              <div>
                <label
                  htmlFor="loan-unit"
                  className="mb-1.5 block text-sm font-semibold"
                >
                  Down payment unit
                </label>
                <select
                  id="loan-unit"
                  className={fieldClass}
                  value={percentageDown ? "percent" : "cash"}
                  onChange={(event) => {
                    const downUnit = event.target.value;
                    const price = Number(values.price);
                    const down = Number(values.down);
                    const converted =
                      downUnit === "cash"
                        ? (price * down) / 100
                        : price > 0
                          ? (down * 100) / price
                          : NaN;
                    setValues((previous) => ({
                      ...previous,
                      downUnit,
                      down:
                        Number.isFinite(converted) && values.down
                          ? String(Number(converted.toFixed(6)))
                          : "",
                    }));
                    setNotice("");
                    setShareUrl("");
                  }}
                >
                  <option value="percent">Percentage (%)</option>
                  <option value="cash">Amount (PKR)</option>
                </select>
              </div>
              {percentageDown && (
                <div className="rounded-lg border border-primary-100 bg-primary-50 p-3 sm:col-span-2">
                  <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-sm">
                    <label htmlFor="loan-down-slider" className="font-semibold">
                      Adjust down payment
                    </label>
                    {!errors.price && !errors.down && (
                      <span className="font-semibold tabular-nums">
                        {pkr(
                          (Number(values.price) * Number(values.down)) / 100,
                        )}
                      </span>
                    )}
                  </div>
                  <input
                    id="loan-down-slider"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={sliderDown}
                    onChange={(event) => update("down", event.target.value)}
                    aria-valuetext={`${sliderDown}% down payment`}
                    className="mt-2 block h-7 w-full cursor-pointer accent-primary-500"
                  />
                  <div
                    aria-hidden="true"
                    className="flex justify-between text-xs text-slate-600"
                  >
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>
              )}
              {islamic ? (
                <>
                  <p className="rounded-lg bg-primary-50 p-3 text-sm text-slate-700 sm:col-span-2">
                    Enter the monthly rental or payment from your provider’s
                    quote. This estimate assumes equal payments and adds any
                    quoted final payment. Ijarah and Diminishing Musharakah have
                    different terms.
                  </p>
                  {amount("rental", "Quoted monthly payment")}
                  {amount("finalPayment", "Quoted final payment (optional)", {
                    optional: true,
                  })}
                </>
              ) : (
                amount("rate", "Annual markup", { suffix: "%" })
              )}
              {amount("fee", "Processing fee (optional)", { optional: true })}
              {amount("insurance", "Upfront insurance / takaful (optional)", {
                optional: true,
              })}
            </div>
            <ListingPrice onApply={(price) => update("price", price)} />
          </section>

          <section className={panel} aria-labelledby="loan-result">
            <div className="rounded-xl bg-gradient-to-r from-primary to-[#FF6A07] p-5 text-white relative">
              <h2 id="loan-result" className="text-sm font-semibold text-white">
                {islamic
                  ? "Quoted monthly payment"
                  : "Estimated monthly instalment"}
              </h2>
              <p
                aria-live="polite"
                className="mt-2 break-words text-3xl font-bold text-white sm:text-4xl"
              >
                {result ? pkr(result.monthly) : "—"}
              </p>
              {result && (
                <p className="mt-1 text-sm text-white">
                  {result.months} monthly payments
                </p>
              )}
              <div className="absolute h-10 w-10 bg-white/20 top-4 right-16 rounded-full animate-pulse duration-500 ease-in" />
              <div className="absolute h-16 w-16 bg-white/20 -bottom-3 -right-2 rounded-full animate-pulse duration-500 ease-in" />
            </div>
            {result ? (
              <dl className="mt-4 divide-y divide-slate-100 text-sm">
                {resultRows(result).map(([label, value]) => (
                  <div
                    key={label}
                    className="flex flex-wrap justify-between gap-x-3 gap-y-1 py-2.5"
                  >
                    <dt className="text-slate-600">{label}</dt>
                    <dd className="font-semibold tabular-nums">{pkr(value)}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-4 text-sm text-slate-600">
                Complete the financing details to see your estimate.
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                className={button}
                disabled={!result || scenarios.length >= 3}
                onClick={() => {
                  const id = nextScenarioId.current++;
                  setScenarios((previous) => [
                    ...previous,
                    { id, values, result },
                  ]);
                  setNotice("Scenario added to the comparison below.");
                }}
              >
                <Plus aria-hidden="true" className="h-4 w-4" /> Save scenario
              </button>
              <button className={button} disabled={!result} onClick={copyLink}>
                <Copy aria-hidden="true" className="h-4 w-4" /> Copy link
              </button>
              <button
                className={button}
                disabled={!result}
                onClick={() =>
                  window.open(
                    `https://wa.me/?text=${encodeURIComponent(`SELLO car financing estimate: ${pkr(result.monthly)} per month. ${getLink()}`)}`,
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
              >
                WhatsApp
              </button>
              <button className={button} disabled={!result} onClick={download}>
                <Download aria-hidden="true" className="h-4 w-4" /> PDF
              </button>
            </div>
            {notice && (
              <p role="status" className="mt-3 text-sm">
                {notice}
              </p>
            )}
            {shareUrl && (
              <input
                aria-label="Shareable calculation link"
                className={`${fieldClass} mt-2`}
                value={shareUrl}
                readOnly
                onFocus={(event) => event.target.select()}
              />
            )}
          </section>
        </div>

        <section className={panel} aria-labelledby="loan-compare">
          <h2 id="loan-compare" className="text-xl font-bold">
            Compare financing scenarios
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Save up to three estimates to compare the monthly payment and total
            cost across terms.
          </p>
          {scenarios.length > 0 && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {scenarios.map(
                ({ id, values: saved, result: estimate }, index) => (
                  <article
                    key={id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold">Scenario {index + 1}</h3>
                      <button
                        type="button"
                        className="rounded-md p-2 hover:bg-slate-100"
                        aria-label={`Remove scenario ${index + 1}`}
                        onClick={() => {
                          setScenarios((previous) =>
                            previous.filter((scenario) => scenario.id !== id),
                          );
                          setNotice("");
                        }}
                      >
                        <X aria-hidden="true" className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm text-slate-600">
                      {saved.kind === "islamic"
                        ? "Islamic quote"
                        : `${saved.rate}% annual markup`}{" "}
                      · {estimate.months} months
                    </p>
                    <p className="mt-3 text-xl font-bold">
                      {pkr(estimate.monthly)}
                      <span className="text-xs font-normal"> / month</span>
                    </p>
                    <p className="mt-2 text-sm">
                      Upfront {pkr(estimate.initial)}
                    </p>
                    <p className="text-sm">Total paid {pkr(estimate.total)}</p>
                    <button
                      type="button"
                      className={`${button} mt-3`}
                      onClick={() => {
                        setValues(saved);
                        setShareUrl("");
                        setNotice(
                          `Scenario ${index + 1} loaded into the calculator.`,
                        );
                        document.getElementById("loan-price")?.focus();
                      }}
                    >
                      Load scenario
                    </button>
                  </article>
                ),
              )}
            </div>
          )}
        </section>

        <section className={panel} aria-labelledby="loan-budget">
          <h2 id="loan-budget" className="text-xl font-bold">
            How much car can I afford?
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Start with your take-home income and subtract expenses, debt
            payments, and the amount you want to set aside. This is a budget
            estimate and does not determine bank eligibility.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {[
              ["income", "Monthly take-home income"],
              ["expenses", "Monthly expenses and debts"],
              ["reserve", "Monthly amount to set aside"],
            ].map(([key, label]) => (
              <AmountField
                key={key}
                id={`budget-${key}`}
                label={label}
                value={budget[key]}
                optional={key !== "income"}
                onChange={(value) =>
                  setBudget((previous) => ({ ...previous, [key]: value }))
                }
              />
            ))}
          </div>
          {available !== null && (
            <div
              className="mt-4 rounded-lg bg-slate-50 p-4 text-sm"
              aria-live="polite"
            >
              <p>
                Monthly amount available <strong>{pkr(available)}</strong>
              </p>
              {affordablePrice !== null && (
                <p className="mt-1">
                  Estimated car budget before fees{" "}
                  <strong>{pkr(affordablePrice)}</strong>
                </p>
              )}
            </div>
          )}
          {budget.income && available === null && (
            <p className="mt-3 text-sm text-red-700">
              Enter valid monthly amounts between zero and PKR 1 billion.
            </p>
          )}
        </section>

        <section className={panel} aria-labelledby="loan-banks">
          <h2 id="loan-banks" className="text-xl font-bold">
            Compare Car Financing Options in Pakistan
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Sources reviewed on 18 November 2026. Confirm your rate, down
            payment, tenure, financing limit, eligibility, fees and insurance or
            takaful directly with the provider.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {banks.map((bank) => (
              <article
                key={bank.name}
                className="flex flex-col items-start rounded-xl border border-slate-200 p-4"
              >
                <h3 className="font-semibold">{bank.name}</h3>
                <p className="mt-1 text-sm">{bank.product}</p>
                <p className="mb-3 mt-1 text-sm text-slate-600">{bank.type}</p>
                <p className="mb-4 text-sm leading-relaxed text-slate-700">
                  {bank.terms}
                </p>
                <a
                  href={bank.link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-auto inline-flex items-center gap-1 text-sm font-semibold underline underline-offset-4"
                >
                  Official product details{" "}
                  <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className={panel} aria-labelledby="loan-method">
          <h2 id="loan-method" className="text-xl font-bold">
            How the estimate works
          </h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-700">
            <p>
              The conventional calculation applies the annual markup to a
              reducing loan balance and spreads repayment across the selected
              number of months. With zero markup, it divides the financing
              amount by the number of monthly payments. A longer tenure can
              reduce each payment while increasing total markup.
            </p>
            <p>
              Initial payment includes the down payment and any processing fee
              or insurance you entered. The estimate treats those charges as
              upfront. Add recurring costs to your monthly budget separately.
            </p>
            <p>{DISCLAIMER}</p>
          </div>
          <Link to="/listings" className={`${primary} mt-5`}>
            Find Your Next Car on SELLO{" "}
            <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}
