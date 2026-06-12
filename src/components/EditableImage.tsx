import React, { useState } from 'react';
import { useAdmin } from '../lib/AdminContext';
import { Image as ImageIcon, Check, X, RefreshCw } from 'lucide-react';

interface EditableImageProps {
  id: string;
  defaultSrc: string;
  className?: string;
  alt?: string;
}

export default function EditableImage({ id, defaultSrc, className = "", alt = "" }: EditableImageProps) {
  const { isEditMode, customData, updateCustomData } = useAdmin();
  const [isEditing, setIsEditing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [url, setUrl] = useState(customData[id] || defaultSrc);

  const src = customData[id] || defaultSrc;

  // Sync url state when src changes (e.g. on reset or customData update)
  React.useEffect(() => {
    setUrl(src);
    setHasError(false);
  }, [src]);

  const handleSave = () => {
    updateCustomData(id, url);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setUrl(src);
    setIsEditing(false);
  };

  const handleReset = () => {
    updateCustomData(id, null);
    setUrl(defaultSrc);
    setIsEditing(false);
  };

  return (
    <div className={`relative group w-full h-full flex items-center justify-center bg-slate-50 overflow-hidden ${isEditMode ? 'ring-2 ring-blue-500/20' : ''}`}>
      {hasError ? (
        <div className="flex flex-col items-center justify-center text-slate-300 p-4 text-center">
          <ImageIcon className="w-8 h-8 mb-2 opacity-20" />
          <span className="text-[10px] font-bold uppercase tracking-tighter opacity-50">Ảnh không tải được</span>
        </div>
      ) : (
        <img 
          src={src} 
          alt={alt} 
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          className={`${className} transition-opacity duration-300 ${isEditing ? 'opacity-10' : 'opacity-100'}`}
        />
      )}

      {isEditMode && !isEditing && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/10 z-20">
          <button 
            onClick={() => setIsEditing(true)}
            className="p-3 bg-blue-600 text-white rounded-full shadow-2xl flex items-center gap-2 font-bold text-xs uppercase tracking-widest hover:scale-110 active:scale-95 transition-all"
          >
            <ImageIcon className="w-4 h-4" /> Đổi Ảnh
          </button>
        </div>
      )}

      {isEditing && (
        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm z-30 flex flex-col items-center justify-center">
          <div className="w-full h-full flex flex-col justify-center px-2 py-1 gap-2">
            <input 
              className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white text-[10px] outline-none"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Dán link ảnh..."
              autoFocus
            />
            <div className="flex gap-1 justify-center">
              <button 
                onClick={handleSave}
                className="p-1 px-3 bg-blue-600 text-white rounded text-[10px] font-bold flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Lưu
              </button>
              <button 
                onClick={handleCancel}
                className="p-1 bg-slate-700 text-white rounded"
              >
                <X className="w-3 h-3" />
              </button>
              <button 
                onClick={handleReset}
                title="Khôi phục"
                className="p-1 bg-red-600 text-white rounded"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
