import { useId } from 'react';
import { useCompareVariantsQuery } from '../../redux/services/compareApi';
import { useCarCategories } from '../../hooks/useCarCategories';
import { useGetAllCategoriesQuery } from '../../redux/services/adminApi';
import SearchableSelect from '../common/SearchableSelect';
export const emptyVehicle = () => ({ makeId: '', modelId: '', yearId: '', variant: '' });
export default function VehicleSelector({ value, onChange, index = 1 }) {
  const id = useId();
  const { makes, years, getModelsByMake, carCategoriesQuery } = useCarCategories('Car');
  const yearQuery = useGetAllCategoriesQuery({ type: 'car', subType: 'year', isActive: 'true' });
  const isError = carCategoriesQuery.isError || yearQuery.isError;
  const { data: variants = [] } = useCompareVariantsQuery({ makeId: value.makeId, modelId: value.modelId, yearId: value.yearId }, { skip: !value.makeId || !value.modelId || !value.yearId });
  const options = {
    makeId: makes,
    modelId: getModelsByMake[value.makeId] || [],
    yearId: years,
  };
  return <fieldset className="space-y-3 min-w-0"><legend className="font-semibold mb-3">Vehicle {index}</legend>
    {isError && <p role="alert">Unable to load vehicle options. <button type="button" className="underline" onClick={() => { carCategoriesQuery.refetch(); yearQuery.refetch(); }}>Try again</button></p>}
    {Object.entries({ makeId: 'Brand', modelId: 'Model', yearId: 'Year' }).map(([key, label]) => (
      <SearchableSelect
        key={key}
        label={label}
        required
        value={value[key]}
        options={options[key].map(row => ({ value: row._id, label: row.name }))}
        placeholder={key === 'modelId' && !value.makeId ? 'Select brand first' : `Select ${label.toLowerCase()}`}
        isLoading={key === 'yearId' ? yearQuery.isLoading : carCategoriesQuery.isLoading}
        disabled={key === 'modelId' && !value.makeId}
        onChange={selected => onChange({
          ...value,
          [key]: selected,
          ...(key === 'makeId' ? { modelId: '', variant: '' } : { variant: '' }),
        })}
      />
    ))}
    <label className="block text-sm">Variant (optional)<input maxLength={100} list={`${id}-variants`} className="w-full border rounded-lg p-3 mt-1 text-slate-900" placeholder="Select or enter variant, if known" value={value.variant} onChange={event => onChange({ ...value, variant: event.target.value })}/><datalist id={`${id}-variants`}>{variants.map(variant => <option key={variant} value={variant}/>)}</datalist></label>
  </fieldset>;
}

