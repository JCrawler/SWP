import React, { useState } from 'react';
import { Edit3, Trash2, AlertTriangle, ExternalLink } from 'lucide-react';
import { Portfolio } from '../types';
import { LivePreview } from './LivePreview';

interface PortfolioCardProps {
  portfolio: Portfolio;
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
}

export const PortfolioCard: React.FC<PortfolioCardProps> = ({
  portfolio,
  onEdit,
  onDelete,
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    try {
      await onDelete(portfolio.id);
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  const formattedDate = portfolio.updated_at
    ? new Date(portfolio.updated_at).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <div
      id={`portfolio-card-${portfolio.id}`}
      onClick={() => onEdit(portfolio.id)}
      className="bg-white border border-[#e3e0f5] hover:border-[#3e29bd]/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col group"
    >
      {/* Thumbnail Viewport */}
      <div className="relative h-44 bg-[#f8f7fc] border-b border-[#e3e0f5] overflow-hidden">
        <LivePreview
          htmlCode={portfolio.html_code}
          cssCode={portfolio.css_code}
          title={portfolio.title}
          isThumbnail={true}
        />
        <div className="absolute inset-0 bg-transparent group-hover:bg-[#3e29bd]/5 transition-colors" />
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm p-1.5 rounded-lg text-[#3e29bd] shadow-sm">
          <ExternalLink className="w-4 h-4" />
        </div>
      </div>

      {/* Card Content & Controls */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-[#1e1b2e] text-base line-clamp-1 group-hover:text-[#3e29bd] transition-colors">
            {portfolio.title || 'Untitled Portfolio'}
          </h3>
          {formattedDate && (
            <p className="text-[11px] text-[#6b6580] mt-1">
              Updated {formattedDate}
            </p>
          )}
        </div>

        {confirmDelete ? (
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-3 p-2.5 bg-[#fef2f2] border border-[#fecaca] rounded-xl flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-1.5 text-xs text-[#dc2626] font-medium">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Delete?</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                id={`confirm-delete-btn-${portfolio.id}`}
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="px-2.5 py-1 bg-[#dc2626] text-white text-xs font-semibold rounded-lg hover:bg-[#b91c1c] transition-colors disabled:opacity-50"
              >
                {isDeleting ? '...' : 'Yes'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="px-2 py-1 text-xs text-[#6b6580] hover:text-[#1e1b2e] rounded-lg transition-colors"
              >
                No
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-3 pt-3 border-t border-[#f8f7fc] flex items-center justify-between">
            <span className="text-xs text-[#6b6580] font-mono">
              {(portfolio.html_code?.length || 0) + (portfolio.css_code?.length || 0)} bytes
            </span>
            <div className="flex items-center gap-1">
              <button
                id={`edit-portfolio-btn-${portfolio.id}`}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(portfolio.id);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#3e29bd] bg-[#eeeafd] hover:bg-[#e0d9fc] rounded-lg transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                id={`delete-portfolio-btn-${portfolio.id}`}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDelete(true);
                }}
                className="p-1 text-[#6b6580] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg transition-colors"
                title="Delete portfolio"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
