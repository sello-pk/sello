import { useEffect, useState } from "react";
import Select from "react-select";
import { useCatalogMakesQuery, useCatalogModelsQuery, useCatalogVariantsQuery } from "../../redux/services/carCatalogApi.js";
import { versionLabel, withMake, withModel } from "../../utils/carCatalog.js";
import { trackCompare } from "../ads/loadMarketingScripts.js";

function Typeahead({ id, label, value, query, setQuery, onChange, disabled, prompt, unavailableMessage, getLabel = (option) => option.name }) {
  const options = query.currentData || [];
  const unavailable = Boolean(unavailableMessage && query.error?.status === 404);
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1 block text-sm font-semibold">{label}</label>
      <Select
        inputId={id}
        instanceId={id}
        options={options}
        value={value}
        getOptionLabel={getLabel}
        getOptionValue={(option) => option._id}
        filterOption={null}
        isClearable
        isDisabled={disabled || unavailable}
        isLoading={query.isFetching}
        noOptionsMessage={() => query.isError ? "Options could not be loaded" : "No matching options"}
        placeholder={prompt}
        onInputChange={(value, meta) => {
          if (meta.action === "input-change" || meta.action === "menu-close") setQuery(value);
        }}
        onChange={onChange}
      />
      {unavailable && !disabled && <p className="mt-1 text-xs text-slate-600">{unavailableMessage}</p>}
      {query.isError && !unavailable && !disabled && (
        <button type="button" className="mt-1 text-sm font-semibold text-slate-800 underline" onClick={query.refetch}>Retry {label.toLowerCase()}</button>
      )}
    </div>
  );
}

function useDebouncedQuery() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  useEffect(() => {
    const timeout = setTimeout(() => setQuery(input.trim().slice(0, 80)), 250);
    return () => clearTimeout(timeout);
  }, [input]);
  return [query, setInput];
}

export default function CatalogSelector({ id, value, onChange, showVariant = true, analytics = true }) {
  const [makeSearch, setMakeSearch] = useDebouncedQuery();
  const [modelSearch, setModelSearch] = useDebouncedQuery();
  const [variantSearch, setVariantSearch] = useDebouncedQuery();
  const makes = useCatalogMakesQuery(makeSearch);
  const models = useCatalogModelsQuery({ makeId: value.make?._id, q: modelSearch }, { skip: !value.make });
  const variants = useCatalogVariantsQuery({ modelId: value.model?._id, q: variantSearch }, { skip: !showVariant || !value.model });
  const select = (field, option, next) => {
    onChange(next);
    if (analytics && option) trackCompare(`car_compare_select_${field}`, { catalogue_id: option._id });
  };

  return (
    <div className="grid gap-3">
      <Typeahead id={id+"-make"} label="Make" value={value.make} query={makes} setQuery={setMakeSearch} prompt="Select make" onChange={(make) => {
        setModelSearch("");
        setVariantSearch("");
        select("make", make, withMake(make));
      }} />
      <Typeahead id={id+"-model"} label="Model" value={value.model} query={models} setQuery={setModelSearch} disabled={!value.make} prompt="Select model" onChange={(model) => {
        setVariantSearch("");
        select("model", model, withModel(value, model));
      }} />
      {showVariant && <Typeahead id={id+"-version"} label="Version (optional)" value={value.variant} query={variants} setQuery={setVariantSearch} disabled={!value.model} prompt={variants.error?.status === 404 ? "Versions unavailable" : value.model && !variantSearch && variants.currentData?.length === 0 ? "No versions published" : "Select version"} unavailableMessage="Version data is unavailable. You can still compare models." getLabel={versionLabel} onChange={(variant) => select("variant", variant, { ...value, variant })} />}
    </div>
  );
}
