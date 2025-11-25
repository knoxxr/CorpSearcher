'use client';

import { Trash2, Search, AlertCircle } from 'lucide-react';
import { Company } from '../page';
import { useState, useRef, useEffect, useCallback } from 'react';

interface Props {
    companies: Company[];
    onUpdate: (id: string, field: keyof Company, value: any) => void;
    onRemove: (id: string) => void;
    onSearch: (id: string, query: string) => void;
    onResolve: (id: string) => void;
}

export default function CompanyTable({ companies, onUpdate, onRemove, onSearch, onResolve }: Props) {
    const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>({
        actions: 50,
        queryName: 250,
        status: 120,
        type: 100,
        ceo: 100,
        industry: 150,
        majorBusiness: 200,
        establishmentDate: 120,
        revenue: 150,
        employees: 120,
        address: 200,
        homepage: 150
    });

    const [isResizing, setIsResizing] = useState<string | null>(null);
    const startXRef = useRef<number>(0);
    const startWidthRef = useRef<number>(0);

    const handleMouseDown = (e: React.MouseEvent, key: string) => {
        e.preventDefault();
        setIsResizing(key);
        startXRef.current = e.clientX;
        startWidthRef.current = columnWidths[key];
        document.body.style.cursor = 'col-resize';
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isResizing) return;
        const diff = e.clientX - startXRef.current;
        const newWidth = Math.max(50, startWidthRef.current + diff);
        setColumnWidths(prev => ({ ...prev, [isResizing]: newWidth }));
    }, [isResizing]);

    const handleMouseUp = useCallback(() => {
        setIsResizing(null);
        document.body.style.cursor = 'default';
    }, []);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, handleMouseMove, handleMouseUp]);

    const renderResizer = (key: string) => (
        <div
            className={`resizer ${isResizing === key ? 'resizing' : ''}`}
            onMouseDown={(e) => handleMouseDown(e, key)}
        />
    );

    return (
        <div className="table-container flex-1 overflow-auto relative min-h-0">
            <table className="company-table w-full border-collapse text-sm" style={{ tableLayout: 'fixed' }}>
                <thead>
                    <tr>
                        <th style={{ width: columnWidths.actions }}></th>
                        <th style={{ width: columnWidths.queryName }}>
                            Company Name (Search)
                            {renderResizer('queryName')}
                        </th>
                        <th style={{ width: columnWidths.status }}>
                            Status
                            {renderResizer('status')}
                        </th>
                        <th style={{ width: columnWidths.type }}>
                            Type
                            {renderResizer('type')}
                        </th>
                        <th style={{ width: columnWidths.ceo }}>
                            CEO
                            {renderResizer('ceo')}
                        </th>
                        <th style={{ width: columnWidths.industry }}>
                            Industry
                            {renderResizer('industry')}
                        </th>
                        <th style={{ width: columnWidths.majorBusiness }}>
                            Major Business
                            {renderResizer('majorBusiness')}
                        </th>
                        <th style={{ width: columnWidths.establishmentDate }}>
                            Est. Date
                            {renderResizer('establishmentDate')}
                        </th>
                        <th style={{ width: columnWidths.revenue }}>
                            Revenue
                            {renderResizer('revenue')}
                        </th>
                        <th style={{ width: columnWidths.employees }}>
                            Employees
                            {renderResizer('employees')}
                        </th>
                        <th style={{ width: columnWidths.address }}>
                            Address
                            {renderResizer('address')}
                        </th>
                        <th style={{ width: columnWidths.homepage }}>
                            Homepage
                            {renderResizer('homepage')}
                        </th>
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
                                {company.status === 'done' && <span className="status-badge status-done">Done</span>}
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
