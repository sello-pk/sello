import { useId } from 'react';
import { useCompareVariantsQuery } from '../../redux/services/compareApi';
import SearchableSelect from '../common/SearchableSelect';
import { compareFuelTypes, compareTransmissionTypes } from '../../constants/carCompare';
export default function VehicleSelector({ value, onChange, index = 1, makes, models = [], years, loading }) {
  const id = useId();
  const { currentData: variants = [] } = useCompareVariantsQuery(value, { skip: !value.makeId || !value.modelId || !value.yearId || !value.fuelType || !value.transmission });
  const options = {
    makeId: makes,
    modelId: models,
    yearId: years,
  };
  return <fieldset className="space-y-3 min-w-0"><legend className="font-semibold mb-3">Vehicle {index}</legend>
    {Object.entries({ makeId: 'Brand', modelId: 'Model', yearId: 'Year' }).map(([key, label]) => (
      <SearchableSelect
        key={key}
        label={label}
        required
        value={value[key]}
        options={options[key].map(row => ({ value: row._id, label: row.name }))}
        placeholder={key === 'modelId' && !value.makeId ? 'Select brand first' : `Select ${label.toLowerCase()}`}
        isLoading={loading}
        disabled={(key === 'modelId' && !value.makeId) || (key === 'yearId' && !value.modelId)}
        onChange={selected => onChange({
          ...value,
          [key]: selected,
          ...(key === 'makeId' ? { modelId: '', yearId: '', variant: '', fuelType: '', transmission: '' } : key === 'modelId' ? { yearId: '', variant: '', fuelType: '', transmission: '' } : { variant: '', fuelType: '', transmission: '' }),
        })}
      />
    ))}
    <label className="block text-sm">Variant (optional)<input disabled={!value.yearId} maxLength={100} list={`${id}-variants`} className="w-full border rounded-lg p-3 mt-1 text-slate-900" placeholder="Select or enter variant, if known" value={value.variant} onChange={event => onChange({ ...value, variant: event.target.value })}/><datalist id={`${id}-variants`}>{variants.map(variant => <option key={variant} value={variant}/>)}</datalist></label>
    <SearchableSelect label="Fuel Type" required value={value.fuelType} options={compareFuelTypes.map(label => ({ value: label, label }))} placeholder="Select fuel type" disabled={!value.yearId} onChange={fuelType => onChange({ ...value, fuelType })} />
    <SearchableSelect label="Transmission" required value={value.transmission} options={compareTransmissionTypes.map(label => ({ value: label, label }))} placeholder="Select transmission" disabled={!value.yearId} onChange={transmission => onChange({ ...value, transmission })} />
  </fieldset>;
}
