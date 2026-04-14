import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Category, TodoTask } from '../models/task.model';
import { LocalStorageService } from './local-storage.service';

const TASKS_STORAGE_KEY = 'todo.tasks.v1';
const CATEGORIES_STORAGE_KEY = 'todo.categories.v1';

@Injectable({
  providedIn: 'root',
})
export class TaskStoreService {
  private readonly tasksSubject = new BehaviorSubject<TodoTask[]>([]);
  private readonly categoriesSubject = new BehaviorSubject<Category[]>([]);
  private ready = false;

  readonly tasks$ = this.tasksSubject.asObservable();
  readonly categories$ = this.categoriesSubject.asObservable();

  constructor(private readonly storage: LocalStorageService) {}

  async init(): Promise<void> {
    if (this.ready) {
      return;
    }

    const [tasks, categories] = await Promise.all([
      this.storage.get<TodoTask[]>(TASKS_STORAGE_KEY, []),
      this.storage.get<Category[]>(CATEGORIES_STORAGE_KEY, []),
    ]);

    this.tasksSubject.next(tasks);
    this.categoriesSubject.next(categories);
    this.ready = true;
  }

  async addTask(title: string, categoryId: string | null): Promise<void> {
    const now = new Date().toISOString();
    const task: TodoTask = {
      id: crypto.randomUUID(),
      title: title.trim(),
      completed: false,
      categoryId,
      createdAt: now,
      updatedAt: now,
    };
    await this.replaceTasks([task, ...this.tasksSubject.value]);
  }

  async toggleTask(taskId: string): Promise<void> {
    await this.replaceTasks(
      this.tasksSubject.value.map(task =>
        task.id === taskId
          ? { ...task, completed: !task.completed, updatedAt: new Date().toISOString() }
          : task,
      ),
    );
  }

  async deleteTask(taskId: string): Promise<void> {
    await this.replaceTasks(this.tasksSubject.value.filter(task => task.id !== taskId));
  }

  async addCategory(name: string, color: string): Promise<void> {
    const category: Category = {
      id: crypto.randomUUID(),
      name: name.trim(),
      color,
      createdAt: new Date().toISOString(),
    };
    await this.replaceCategories([category, ...this.categoriesSubject.value]);
  }

  async updateCategory(categoryId: string, name: string, color: string): Promise<void> {
    await this.replaceCategories(
      this.categoriesSubject.value.map(category =>
        category.id === categoryId ? { ...category, name: name.trim(), color } : category,
      ),
    );
  }

  async deleteCategory(categoryId: string): Promise<void> {
    await this.replaceCategories(this.categoriesSubject.value.filter(category => category.id !== categoryId));
    await this.replaceTasks(
      this.tasksSubject.value.map(task =>
        task.categoryId === categoryId
          ? { ...task, categoryId: null, updatedAt: new Date().toISOString() }
          : task,
      ),
    );
  }

  private async replaceTasks(next: TodoTask[]): Promise<void> {
    this.tasksSubject.next(next);
    await this.storage.set(TASKS_STORAGE_KEY, next);
  }

  private async replaceCategories(next: Category[]): Promise<void> {
    this.categoriesSubject.next(next);
    await this.storage.set(CATEGORIES_STORAGE_KEY, next);
  }
}

