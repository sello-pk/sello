import { useState } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/features/admin/AdminLayout';
import CompareMonitoring from '../../components/compare/CompareMonitoring';
import { SeoSections } from '../CarCompare';
import { defaultCompareContent } from '../../constants/carCompare.js';
import { useCompareAdminConfigQuery, useSaveCompareConfigMutation } from '../../redux/services/compareApi';
import { api } from '../../redux/services/api';
import { useDispatch } from 'react-redux';

function ImageUpload({ onUploaded }) {
  const dispatch = useDispatch();
  const [busy, setBusy] = useState(false);
  return <label className="block text-sm my-2">{busy ? 'Uploading…' : 'Upload image'}<input type="file" accept="image/*" disabled={busy} className="block mt-1" onChange={async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const body = new FormData(); body.append('image', file);
      const response = await dispatch(api.endpoints.compareUpload.initiate(body)).unwrap();
      const url = response?.data?.url || response?.url;
      if (!url) throw new Error('Upload did not return an image');
      onUploaded(url);
    } catch (error) { toast.error(error?.data?.message || error.message || 'Upload failed'); }
    finally { setBusy(false); }
  }}/></label>;
}
export function CompareSettings() {
  const { data, refetch, isError } = useCompareAdminConfigQuery();
  const [save, { isLoading }] = useSaveCompareConfigMutation();
  const [draft, setDraft] = useState(null);
  const [preview, setPreview] = useState(false);
  const config = draft || data;
  if (!config) return <p>{isError ? 'Settings unavailable. Please refresh.' : 'Loading comparison settings…'}</p>;
  const sections = config.draftSections?.length === 4 ? config.draftSections : config.sections || defaultCompareContent;
  const change = (key, value) => setDraft({ ...config, [key]: value });
  const changeSection = (index, key, value) => change('draftSections', sections.map((section, position) => position === index ? { ...section, [key]: value } : section));
  const submit = async publish => {
    try {
      await save({ sections, publish, ...(config.fuelPrice ? { fuelPrice: config.fuelPrice, fuelDate: config.fuelDate, fuelSource: config.fuelSource } : {}) }).unwrap();
      setDraft(null); refetch(); toast.success(publish ? 'Comparison content published' : 'Settings and draft saved');
    } catch (error) { toast.error(error?.data?.message || 'Unable to save'); }
  };
  return <section className="bg-white text-slate-900 p-6 rounded-xl border"><h2 className="text-2xl font-bold mb-4">Car Compare settings and content</h2><fieldset className="grid md:grid-cols-3 gap-3 my-6"><legend className="font-semibold mb-2">Approved petrol price</legend>{[['fuelPrice', 'PKR per litre', 'number'], ['fuelDate', 'Effective date', 'date'], ['fuelSource', 'Internal source reference', 'text']].map(([key, label, type]) => <label key={key}>{label}<input type={type} className="border rounded p-2 block w-full" value={key === 'fuelDate' ? (config[key] || '').slice(0, 10) : config[key] || ''} onChange={event => change(key, event.target.value)}/></label>)}</fieldset>
    {sections.map((section, index) => <fieldset key={index} className="border rounded-xl p-4 my-4"><legend>Guide {index + 1}</legend>{[['title', 'Title'], ['description', 'Description'], ['image', 'Image URL'], ['alt', 'Image ALT text']].map(([key, label]) => <label key={key} className="block my-2">{label}{key === 'description' ? <textarea rows={4} className="border p-2 rounded block w-full" value={section[key]} onChange={event => changeSection(index, key, event.target.value)}/> : <input className="border p-2 rounded block w-full" value={section[key]} onChange={event => changeSection(index, key, event.target.value)}/>}</label>)}<ImageUpload onUploaded={url => changeSection(index, 'image', url)}/></fieldset>)}
    <div className="flex flex-wrap gap-3"><button disabled={isLoading} className="border rounded px-4 py-2" onClick={() => submit(false)}>Save draft and settings</button><button className="border rounded px-4 py-2" onClick={() => setPreview(!preview)}>Preview content</button><button disabled={isLoading} className="bg-primary-500 rounded px-4 py-2" onClick={() => submit(true)}>Publish content</button></div>{preview && <SeoSections sections={sections}/>}</section>;
}
export default function CarCompareAdmin() {
  return <AdminLayout><CompareSettings /><CompareMonitoring /></AdminLayout>;
}
