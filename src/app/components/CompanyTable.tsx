'use client';

import { Trash2, Search, AlertCircle } from 'lucide-react';
import { Company } from '../page';

interface Props {
    companies: Company[];
    onUpdate: (id: string, field: keyof Company, value: any) => void;
    onRemove: (id: string) => void;
    onSearch: (id: string, query: string) => void;
    onResolve: (id: string) => void;
}

export default function CompanyTable({ companies, onUpdate, onRemove, onSearch, onResolve }: Props) {
    return (
        <div className="table-container flex-1 overflow-auto relative">
            <table className="company-table w-full border-collapse text-sm">
                <thead>
                    <tr>
                        <th style={{ width: '50px' }}></th>
                        <th style={{ minWidth: '250px' }}>Company Name (Search)</th>
                        <th style={{ minWidth: '120px' }}>Status</th>
                        <th style={{ minWidth: '100px' }}>Type</th>
                        <th style={{ minWidth: '100px' }}>CEO</th>
                        <th style={{ minWidth: '150px' }}>Industry</th>
                        <th style={{ minWidth: '200px' }}>Major Business</th>
                        <th style={{ minWidth: '120px' }}>Est. Date</th>
                        <th style={{ minWidth: '150px' }}>Revenue</th>
                        <th style={{ minWidth: '120px' }}>Employees</th>
                        <th style={{ minWidth: '200px' }}>Address</th>
                        <th style={{ minWidth: '150px' }}>Homepage</th>
                    </tr>
                </thead>
                <tbody>
                    {companies.map((company) => (
                        <tr key={company.id}>
                            <td style={{ textAlign: 'center' }}>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => onRemove(company.id)}
                                    title="Remove row"
                                    style={{ padding: '0.25rem' }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </td>
                            <td>
                                <div className="input-search-wrapper">
                                    <input
                                        className="input input-search"
                                        type="text"
                                        value={company.queryName}
                                        onChange={(e) => onUpdate(company.id, 'queryName', e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                onSearch(company.id, company.queryName);
                                            }
                                        }}
                                        placeholder="Enter company name..."
                                    />
                                    <Search
                                        className="search-icon"
                                        size={18}
                                        onClick={() => onSearch(company.id, company.queryName)}
                                    />
                                </div>
                            </td>
                            <td>
                                {company.status === 'loading' && <span className="status-badge status-loading">Searching...</span>}
                                {company.status === 'error' && <span className="status-badge status-error">Not Found</span>}
                                {company.status === 'multiple' && (
                                    <div
                                        className="status-badge status-multiple"
                                        onClick={() => onResolve(company.id)}
                                    >
                                        <AlertCircle size={14} style={{ marginRight: '4px' }} />
                                        Multiple ({company.candidates?.length})
                                    </div>
                                )}
                                {company.status === 'done' && <span className="status-badge" style={{ background: '#dcfce7', color: '#166534' }}>Done</span>}
                            </td>
                            <td><input className="input" type="text" value={company.type} onChange={(e) => onUpdate(company.id, 'type', e.target.value)} /></td>
                            <td><input className="input" type="text" value={company.ceo} onChange={(e) => onUpdate(company.id, 'ceo', e.target.value)} /></td>
                            <td><input className="input" type="text" value={company.industry} onChange={(e) => onUpdate(company.id, 'industry', e.target.value)} /></td>
                            <td><input className="input" type="text" value={company.majorBusiness} onChange={(e) => onUpdate(company.id, 'majorBusiness', e.target.value)} /></td>
                            <td><input className="input" type="text" value={company.establishmentDate} onChange={(e) => onUpdate(company.id, 'establishmentDate', e.target.value)} /></td>
                            <td><input className="input" type="text" value={company.revenue} onChange={(e) => onUpdate(company.id, 'revenue', e.target.value)} /></td>
                            <td><input className="input" type="text" value={company.employees} onChange={(e) => onUpdate(company.id, 'employees', e.target.value)} /></td>
                            <td><input className="input" type="text" value={company.address} onChange={(e) => onUpdate(company.id, 'address', e.target.value)} /></td>
                            <td><input className="input" type="text" value={company.homepage} onChange={(e) => onUpdate(company.id, 'homepage', e.target.value)} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
