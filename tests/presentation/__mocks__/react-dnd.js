export const useDrag = () => [{ isDragging: false }, () => {}];
export const useDrop = () => [{ isOver: false }, () => {}];
export const DndProvider = ({ children }) => children;