"use client";
import React, { useRef, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import Card from './Card';
import { Task } from '../domain/task';
import { BoardService } from '../services/boardService';

interface ColumnProps {
  tasks: Task[];
  columnId: string;
}

const Column: React.FC<ColumnProps> = ({ tasks, columnId }) => {
  interface DragItem {
    id: string;
    fromCol: string;
    fromIndex: number;
  }

  const [{ isOver }, drop] = useDrop<DragItem, void, { isOver: boolean }>({
    accept: 'CARD',
    drop: (item) => {
      if (item.fromCol === columnId) return;
      // Move to top of the target column for demo simplicity
      BoardService.prototype.moveTask(item.fromCol, columnId, item.fromIndex, 0);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (ref.current) {
      drop(ref);
    }
  }, [drop])

  return (
    <div ref={ref} className={`flex flex-col gap-3 rounded-md border border-white/10 bg-white/5 p-3 ${isOver ? 'ring-2 ring-blue-400/60' : ''}`}>
      {tasks.map((task, i) => (
        <Card key={task.id} task={task} fromCol={columnId} index={i} />
      ))}
    </div>
  );
};

export default Column;
