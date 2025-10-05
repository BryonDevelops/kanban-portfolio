"use client";

import { useState, useEffect } from 'react';
import { useIsAdmin } from '../../../shared/ProtectedRoute';
import { useUser } from '@clerk/nextjs';
import { Category } from '@/domain/microblog/entities/category';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Badge } from '@/presentation/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/presentation/components/ui/dialog';
import { Textarea } from '@/presentation/components/ui/textarea';
import { ColorPicker } from '@/presentation/components/shared/color-picker';
import { X, Plus, Tag as TagIcon } from 'lucide-react';

interface CategorySelectorProps {
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  className?: string;
}

export function CategorySelector({ selectedCategories, onCategoriesChange, className = '' }: CategorySelectorProps) {
  const isAdmin = useIsAdmin();
  const { user, isLoaded } = useUser();
  const isLoggedIn = isLoaded && !!user;
  const canManageCategories = isLoggedIn && isAdmin;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('from-blue-500 to-cyan-500');

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryToggle = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoriesChange(selectedCategories.filter(id => id !== categoryId));
    } else {
      onCategoriesChange([...selectedCategories, categoryId]);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim() || !canManageCategories) return;

    try {
      const categoryData = {
        name: newCategoryName.trim(),
        slug: newCategoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description: newCategoryDescription.trim() || undefined,
        color: newCategoryColor.trim()
      };

      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      if (response.ok) {
        const newCategory = await response.json();
        setCategories(prev => [...prev, newCategory]);
        onCategoriesChange([...selectedCategories, newCategory.id]);
        setIsCreateDialogOpen(false);
        setNewCategoryName('');
        setNewCategoryDescription('');
        setNewCategoryColor('from-blue-500 to-cyan-500');
      }
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  const getSelectedCategoryNames = () => {
    return selectedCategories.map(id => {
      const category = categories.find(c => c.id === id);
      return category ? category.name : id;
    });
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
            Categories
          </label>
          {canManageCategories && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  New
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Category</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <Input
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Category name"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description (optional)</label>
                    <Textarea
                      value={newCategoryDescription}
                      onChange={(e) => setNewCategoryDescription(e.target.value)}
                      rows={2}
                      placeholder="Brief description"
                    />
                  </div>
                  <div>
                    <ColorPicker
                      value={newCategoryColor}
                      onChange={setNewCategoryColor}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateCategory}
                      disabled={!newCategoryName.trim()}
                    >
                      Create
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Selected categories display */}
        {selectedCategories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {getSelectedCategoryNames().map((name, index) => (
              <Badge
                key={selectedCategories[index]}
                variant="secondary"
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
              >
                <TagIcon className="h-3 w-3" />
                {name}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCategoryToggle(selectedCategories[index]);
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 ml-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Available categories */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
          {categories.map((category) => {
            const isSelected = selectedCategories.includes(category.id);
            return (
              <button
                key={category.id}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCategoryToggle(category.id);
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className={`p-2 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${category.color}`} />
                  <span className="text-xs font-medium truncate">{category.name}</span>
                </div>
                {category.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {category.description}
                  </p>
                )}
              </button>
            );
          })}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-4 text-slate-500 dark:text-slate-400 text-sm">
            No categories available. {canManageCategories && 'Create one to get started.'}
          </div>
        )}
      </div>
    </div>
  );
}