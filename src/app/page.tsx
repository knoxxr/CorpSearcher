'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Download, Trash2, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';
import CompanyTable from './components/CompanyTable';
import SelectionModal from './components/SelectionModal';

export interface Company {
  id: string;
  queryName: string;
  name: string;
  type: string;
  ceo: string;
  industry: string;
  majorBusiness: string;
  establishmentDate: string;
  revenue: string;
  employees: string;
  address: string;
  homepage: string;
  status: 'idle' | 'loading' | 'done' | 'error' | 'multiple';
  candidates?: any[];
}

export default function Home() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentResolvingId, setCurrentResolvingId] = useState<string | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('corp-searcher-data');
    if (saved) {
      try {
        setCompanies(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load data', e);
      }
    } else {
      // Add one empty row by default
      addCompanyRow();
    }
  }, []);

  // Save to local storage whenever companies change
  useEffect(() => {
    localStorage.setItem('corp-searcher-data', JSON.stringify(companies));
  }, [companies]);

  // Simple UUID generator for non-secure contexts
  const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const addCompanyRow = () => {
    const newCompany: Company = {
      id: generateUUID(),
      queryName: '',
      name: '',
      type: '',
      ceo: '',
      industry: '',
      majorBusiness: '',
      establishmentDate: '',
      revenue: '',
      employees: '',
      address: '',
      homepage: '',
      status: 'idle'
    };
    setCompanies(prev => [...prev, newCompany]);
  };

  const removeCompanyRow = (id: string) => {
    setCompanies(prev => prev.filter(c => c.id !== id));
  };

  const clearAll = () => {
    if (confirm('Are you sure you want to clear all data?')) {
      setCompanies([]);
      addCompanyRow();
    }
  };

  const updateCompany = (id: string, field: keyof Company, value: any) => {
    setCompanies(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, [field]: value };
      }
      return c;
    }));
  };

  const handleSearch = async (id: string, queryName: string) => {
    if (!queryName.trim()) return;

    updateCompany(id, 'status', 'loading');
    updateCompany(id, 'queryName', queryName);

    try {
      const res = await fetch(`/api/search?companyName=${encodeURIComponent(queryName)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.details || data.error || 'Failed to search');
      }

      const candidates = data;

      if (candidates.length === 0) {
        updateCompany(id, 'status', 'error');
      } else if (candidates.length === 1) {
        // Exact match found, fetch details
        await fetchCompanyDetails(id, candidates[0].link);
      } else {
        // Multiple matches
        setCompanies(prev => prev.map(c => {
          if (c.id === id) {
            return {
              ...c,
              status: 'multiple',
              candidates: candidates
            };
          }
          return c;
        }));
      }
    } catch (e: any) {
      console.error(e);
      alert(`Search failed: ${e.message}`);
      updateCompany(id, 'status', 'error');
    }
  };

  const fetchCompanyDetails = async (id: string, url: string) => {
    try {
      const res = await fetch(`/api/company?url=${encodeURIComponent(url)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.details || data.error || 'Failed to fetch details');
      }

      const details = data;

      setCompanies(prev => prev.map(c => {
        if (c.id === id) {
          return {
            ...c,
            ...details,
            status: 'done',
            candidates: undefined
          };
        }
        return c;
      }));
    } catch (e: any) {
      console.error(e);
      alert(`Details fetch failed: ${e.message}`);
      updateCompany(id, 'status', 'error');
    }
  };

  const handleResolve = (id: string) => {
    setCurrentResolvingId(id);
    setModalOpen(true);
  };

  const handleSelectCandidate = (candidate: any) => {
    if (currentResolvingId) {
      // Close modal first
      setModalOpen(false);
      // Set status to loading while fetching details
      updateCompany(currentResolvingId, 'status', 'loading');
      // Fetch details
      fetchCompanyDetails(currentResolvingId, candidate.link);
      setCurrentResolvingId(null);
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(companies.map(({ id, status, candidates, ...rest }) => rest));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Companies");
    XLSX.writeFile(wb, "company_info.xlsx");
  };

  return (
    <main className="container">
      <div className="header">
        <h1 className="title">CorpSearcher</h1>
        <div className="actions">
          <button className="btn btn-secondary" onClick={clearAll}>
            <Trash2 size={16} /> Clear All
          </button>
          <button className="btn btn-primary" onClick={exportToExcel}>
            <Download size={16} /> Export Excel
          </button>
          <button className="btn btn-primary" onClick={addCompanyRow}>
            <Plus size={16} /> Add Row
          </button>
        </div>
      </div>

      <CompanyTable
        companies={companies}
        onUpdate={updateCompany}
        onRemove={removeCompanyRow}
        onSearch={handleSearch}
        onResolve={handleResolve}
      />

      {modalOpen && currentResolvingId && (
        <SelectionModal
          candidates={companies.find(c => c.id === currentResolvingId)?.candidates || []}
          onSelect={handleSelectCandidate}
          onClose={() => {
            setModalOpen(false);
            setCurrentResolvingId(null);
          }}
        />
      )}
    </main>
  );
}
