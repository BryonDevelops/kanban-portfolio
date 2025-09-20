import { BoardService } from '../../../../services/board/boardService';
import { IBoardRepository } from '../../../../domain/board/repositories/boardRepository.interface';
import { Task } from '../../../../domain/board/entities/task';
import { Project } from '../../../../domain/board/entities/project';

// Mock repository implementation
export class MockBoardRepository implements IBoardRepository {
    existsByTitle = jest.fn();
    fetchTasks = jest.fn();
    fetchProjects = jest.fn();
    addProject = jest.fn();
    updateProject = jest.fn();
    deleteProject = jest.fn();
    fetchTasksForProject = jest.fn();
    addTask = jest.fn();
    updateTask = jest.fn();
    deleteTask = jest.fn();
    moveTask = jest.fn();
    reorderTasks = jest.fn();
    saveTasks = jest.fn();
    saveProject = jest.fn();
    fetchProjectById = jest.fn();
    fetchProjectByStatus = jest.fn();
}