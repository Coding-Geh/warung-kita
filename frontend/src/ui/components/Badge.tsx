import React from 'react';

export function Badge({ children }: { children: React.ReactNode }) {
	return <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{children}</span>;
}
