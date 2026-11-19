const positive = (value) => Number.isFinite(Number(value)) && Number(value) > 0 ? Number(value) : null;

export function runningCost({ distance, petrol, electricity, fuelAverage, energyUse, fuelType }) {
  const km = positive(distance);
  if (!km) return null;
  const electric = /^(electric|ev|bev)$/i.test(fuelType || "");
  const rate = positive(electric ? electricity : petrol);
  const efficiency = positive(electric ? energyUse : fuelAverage);
  if (!rate || !efficiency || (!electric && (!/petrol|gasoline|hybrid/i.test(fuelType || "") || /diesel/i.test(fuelType)))) return null;
  const monthly = electric ? km * efficiency * rate / 100 : km * rate / efficiency;
  return Number.isFinite(monthly) ? { monthly, annual: monthly * 12 } : null;
}
