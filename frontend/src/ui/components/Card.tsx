import React from 'react';

export function Card({ children }: { children: React.ReactNode }) {
	return <div className="bg-white rounded-lg border shadow-sm p-3">{children}</div>;
}
