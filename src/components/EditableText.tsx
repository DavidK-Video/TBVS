import React, { useState, useEffect } from 'react';
import { useAdmin } from '../lib/AdminContext';
import { Edit2, Check, X } from 'lucide-react';

interface EditableTextProps {
  id: string;
  defaultText: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'div' | 'p' | 'span';
}

export default function EditableText({ id, defaultText, className = "", as: Tag = "span" }: EditableTextProps) {
  const { isEditMode, customData, updateCustomData } = useAdmin();
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(customData[id] || defaultText);

  useEffect(() => {
    if (customData[id]) {
      setText(customData[id]);
    }
  }, [customData, id]);

  const handleSave = () => {
    updateCustomData(id, text);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setText(customData[id] || defaultText);
    setIsEditing(false);
  };

  if (isEditMode) {
    return (
      <span className={`relative group inline-block ${className}`}>
        {isEditing ? (
          <span className="flex items-center gap-2">
            <textarea
              className="bg-white border-2 border-blue-500 rounded px-2 py-1 text-slate-900 outline-none w-full"
              value={text}
              onChange={(e) => setText(e.target.value)}
              autoFocus
            />
            <span className="flex flex-col gap-1">
              <button 
                onClick={handleSave}
                className="p-1 bg-green-500 text-white rounded hover:bg-green-600 shadow-sm"
              >
                <Check className="w-3 h-3" />
              </button>
              <button 
                onClick={handleCancel}
                className="p-1 bg-red-500 text-white rounded hover:bg-red-600 shadow-sm"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Tag className={className}>{text}</Tag>
            <button 
              onClick={() => setIsEditing(true)}
              className="p-1.5 bg-blue-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity absolute -right-8 top-1/2 -translate-y-1/2 z-10 shadow-lg"
              title="Edit text"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          </span>
        )}
      </span>
    );
  }

  return <Tag className={className}>{text}</Tag>;
}
