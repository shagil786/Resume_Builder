export default function HistoryPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Version History</h1>
      <p className="mt-1 text-sm text-slate-500">View and compare past resume versions</p>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-12 text-center">
        <div className="text-4xl">📜</div>
        <p className="mt-3 text-sm text-slate-500">No versions yet. Generate a resume to see history here.</p>
      </div>
    </div>
  );
}
