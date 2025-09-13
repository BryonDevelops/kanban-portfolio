import React from 'react';
import { useDrop } from 'react-dnd';
import { BoardService } from '../services/boardService';
import Column from './Column';

const columnOrder = ['ideas', 'in-progress', 'completed'];

export default function Board() {
  const columns = BoardService.prototype.getColumns();

  // If you want each column to be a drop target, move useDrop into Column
  return (
    <div className="flex gap-4 p-6">
      {columnOrder.map((colId) => (
        <div
          key={colId}
          className="w-80 bg-surface p-4 rounded-md shadow-sm"
        >
          <h3 className="font-semibold mb-2">{colId}</h3>
          <Column columnId={colId} tasks={columns[colId] ?? []} />
        </div>
      ))}
    </div>
  );
}
