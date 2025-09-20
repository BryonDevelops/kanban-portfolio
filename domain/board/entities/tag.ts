export type Tag = {
  id: string;
  name: string;
  color: string; // Hex color code like '#3B82F6'
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export type TagCreate = Omit<Tag, 'id' | 'created_at' | 'updated_at'>;

export type TagUpdate = Partial<Omit<Tag, 'id' | 'created_at' | 'updated_at'>>;