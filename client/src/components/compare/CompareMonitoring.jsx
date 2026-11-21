import { useCompareMetricsQuery } from '../../redux/services/compareApi';

export default function CompareMonitoring() {
  const { data, isError, refetch } = useCompareMetricsQuery(undefined, { pollingInterval: 30000 });
  const stats = data ? [
    ['Requests', data.calls], ['Failures', data.failures],
    ['Average latency', `${data.averageMs} ms`], ['Estimated cost', `$${data.estimatedUsd.toFixed(4)}`],
    ['Input tokens', data.inputTokens], ['Cached input', data.cachedTokens],
    ['Output tokens', data.outputTokens], ['Web searches', data.searchCalls],
  ] : [];
  return <section className="mt-6 rounded-xl border bg-white p-6 text-slate-900">
    <div className="flex justify-between"><h2 className="text-xl font-bold">Car Compare API monitoring</h2><button className="underline" onClick={refetch}>Refresh metrics</button></div>
    {isError ? <p className="mt-3">Metrics unavailable, or your account lacks platform-settings access.</p> : !data ? <p>Loading metrics…</p> : <>
      <p className="my-3 text-sm text-slate-600">{data.costBasis}</p>
      <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">{stats.map(([label, value]) => <div key={label}><dt className="text-sm text-slate-500">{label}</dt><dd className="text-lg font-semibold">{value}</dd></div>)}</dl>
      <p className="mt-4 text-xs text-slate-500">Since {new Date(data.startedAt).toLocaleString()} · {data.unpricedCalls} calls without configured model rates</p>
      <details className="mt-5"><summary>Recent API events</summary><div className="overflow-x-auto"><table className="mt-3 w-full text-left text-sm">
        <thead><tr>{['Time', 'Operation', 'Status', 'Latency', 'Tokens', 'Estimate USD'].map(label => <th className="p-2" key={label}>{label}</th>)}</tr></thead>
        <tbody>{data.recent.slice().reverse().map((event, index) => <tr className="border-t" key={index}><td className="p-2">{new Date(event.at).toLocaleTimeString()}</td><td>{event.operation}</td><td>{event.status}</td><td>{event.durationMs} ms</td><td>{event.inputTokens + event.outputTokens}</td><td>{event.estimatedUsd?.toFixed(4) ?? 'Unpriced'}</td></tr>)}</tbody>
      </table></div></details>
    </>}
  </section>;
}
