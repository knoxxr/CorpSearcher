'use client';

import { X } from 'lucide-react';

interface Props {
    candidates: any[];
    onSelect: (candidate: any) => void;
    onClose: () => void;
}

export default function SelectionModal({ candidates, onSelect, onClose }: Props) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Select Company</h2>
                    <button className="btn btn-secondary" onClick={onClose} style={{ padding: '0.5rem' }}>
                        <X size={18} />
                    </button>
                </div>
                <div className="candidate-list">
                    {candidates.map((candidate, index) => (
                        <div
                            key={index}
                            className="candidate-item"
                            onClick={() => onSelect(candidate)}
                        >
                            <div className="candidate-name">
                                {candidate.name}
                                {candidate.type && <span className="candidate-type">{candidate.type}</span>}
                            </div>
                            <div className="candidate-details">
                                {candidate.ceo && <div><span style={{ fontWeight: 500 }}>CEO:</span> {candidate.ceo}</div>}
                                {candidate.address && <div><span style={{ fontWeight: 500 }}>Address:</span> {candidate.address}</div>}
                                {candidate.industry && <div><span style={{ fontWeight: 500 }}>Industry:</span> {candidate.industry}</div>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
