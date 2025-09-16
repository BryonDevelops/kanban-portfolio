"use client";
import React, { useRef, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import Card from './Card';
import { Project } from '../../../domain/project';
import { Task } from '../../../domain/task';
import { useBoardStore } from '../../stores/board/boardStore';

interface ColumnProps {
  projects: Project[];
  columnId: string;
}

const Column: React.FC<ColumnProps> = ({ projects, columnId }) => {
  const moveTask = useBoardStore((s) => s.moveTask);
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
      // Note: Fire and forget async operation
      moveTask(item.fromCol, columnId, item.fromIndex, 0).catch(console.error);
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
      {projects.map((project, i) => (
        <Card key={project.id} project={project} fromCol={columnId} index={i} />
      ))}
    </div>
  );
};

export default Column;
