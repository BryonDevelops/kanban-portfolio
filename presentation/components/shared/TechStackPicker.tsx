import React, { useState } from 'react';
import { TECH_STACK, TechCategory, TechItem } from '../features/projects/tech-data';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import * as simpleIcons from 'simple-icons';

const CATEGORIES: { label: string; value: TechCategory }[] = [
  { label: 'Languages', value: 'language' },
  { label: 'Databases', value: 'database' },
  { label: 'Frameworks', value: 'framework' },
  { label: 'Tools', value: 'tool' },
  { label: 'Other', value: 'other' },
];

interface TechStackPickerProps {
  value: TechItem[];
  onChange: (items: TechItem[]) => void;
}

export const TechStackPicker: React.FC<TechStackPickerProps> = ({ value, onChange }) => {
  const [category, setCategory] = useState<string>('language');
  const [search, setSearch] = useState('');

  const filtered = TECH_STACK.filter(
    t => t.category === category && t.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (item: TechItem) => {
    if (!value.find(v => v.id === item.id)) {
      onChange([...value, item]);
    }
  };

  const handleRemove = (id: string) => {
    onChange(value.filter(v => v.id !== id));
  };

  return (
    <div>
      <Tabs value={category} onValueChange={setCategory} className="mb-4">
        <TabsList>
          {CATEGORIES.map(cat => (
            <TabsTrigger key={cat.value} value={cat.value}>
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <Input
        placeholder="Search tech..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-4"
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
        {filtered.map(item => (
          <Card
            key={item.id}
            className="flex flex-col items-center p-4 cursor-pointer hover:bg-accent"
            onClick={() => handleSelect(item)}
          >
            <span className="mb-2">
              {/* Render SVG icon from simple-icons */}
              <TechIcon icon={item.icon} />
            </span>
            <span>{item.name}</span>
          </Card>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {value.map(item => (
          <Badge key={item.id} variant="secondary" className="flex items-center gap-1">
            <TechIcon icon={item.icon} size={16} />
            {item.name}
            <button
              type="button"
              className="ml-1 text-xs text-red-500 hover:text-red-700"
              onClick={() => handleRemove(item.id)}
            >
              ×
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
};

// Helper to render a simple-icons SVG
function TechIcon({ icon, size = 32 }: { icon: string; size?: number }) {
  // simple-icons exports as camelCase, e.g. simpleIcons.siTypescript
  const key = 'si' + icon.replace(/[^a-z0-9]/gi, '').replace(/^./, c => c.toUpperCase());
  // @ts-expect-error simple-icons dynamic key access
  const iconData = simpleIcons[key];
  if (!iconData) return <span style={{ width: size, height: size }} />;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={`#${iconData.hex}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-label={iconData.title}
    >
      <path d={iconData.path} />
    </svg>
  );
}
