import React from 'react';
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
      // Example: Use BoardService to move tasks if needed
      // BoardService.prototype.moveTask(item.fromCol, columnId, item.fromIndex, 0);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div ref={(node) => { drop(node); }} className={`p-4 bg-gray-100 rounded ${isOver ? 'bg-blue-100' : ''}`}>
      {tasks.map((task) => (
        <Card key={task.id} task={task} />
      ))}
    </div>
  );
};

export default Column;
