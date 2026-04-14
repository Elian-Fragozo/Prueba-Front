import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { BehaviorSubject, Subject, combineLatest, map, takeUntil } from 'rxjs';
import { Category, TodoTask } from '../core/models/task.model';
import { FeatureFlagsService } from '../core/services/feature-flags.service';
import { TaskStoreService } from '../core/services/task-store.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly selectedCategoryFilter$ = new BehaviorSubject<string>('all');
  private readonly searchTerm$ = new BehaviorSubject<string>('');

  readonly tasks$ = this.store.tasks$;
  readonly categories$ = this.store.categories$;
  readonly categoriesEnabled$ = this.featureFlags.categoriesEnabled$;

  readonly categoryLookup$ = this.categories$.pipe(
    map(categories =>
      categories.reduce<Record<string, Category>>((acc, category) => {
        acc[category.id] = category;
        return acc;
      }, {}),
    ),
  );

  readonly filteredTasks$ = combineLatest([
    this.tasks$,
    this.selectedCategoryFilter$,
    this.searchTerm$,
    this.categoriesEnabled$,
  ]).pipe(
    map(([tasks, selectedCategory, searchTerm, categoriesEnabled]) => {
      const normalizedSearch = searchTerm.trim().toLowerCase();
      return tasks.filter(task => {
        const categoryMatches =
          !categoriesEnabled ||
          selectedCategory === 'all' ||
          (selectedCategory === 'none' ? task.categoryId === null : task.categoryId === selectedCategory);

        const searchMatches =
          normalizedSearch.length === 0 || task.title.toLowerCase().includes(normalizedSearch);

        return categoryMatches && searchMatches;
      });
    }),
  );

  readonly stats$ = this.tasks$.pipe(
    map(tasks => ({
      total: tasks.length,
      completed: tasks.filter(task => task.completed).length,
      pending: tasks.filter(task => !task.completed).length,
    })),
  );

  newTaskTitle = '';
  readonly userName = 'Elian';
  newTaskCategoryId: string | null = null;
  selectedCategoryFilter = 'all';
  searchTerm = '';

  categoryModalOpen = false;
  categoryName = '';
  categoryColor = '#3880ff';
  editingCategoryId: string | null = null;

  constructor(
    private readonly store: TaskStoreService,
    private readonly featureFlags: FeatureFlagsService,
    private readonly toastController: ToastController,
    private readonly alertController: AlertController,
  ) {}

  async ngOnInit(): Promise<void> {
    await Promise.all([this.store.init(), this.featureFlags.init()]);

    this.categoriesEnabled$
      .pipe(takeUntil(this.destroy$))
      .subscribe(enabled => {
        if (!enabled) {
          this.selectedCategoryFilter = 'all';
          this.newTaskCategoryId = null;
          this.selectedCategoryFilter$.next('all');
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async addTask(): Promise<void> {
    const title = this.newTaskTitle.trim();
    if (!title) {
      await this.presentToast('Debes escribir un titulo para la tarea', 'warning');
      return;
    }

    await this.store.addTask(title, this.newTaskCategoryId);
    this.newTaskTitle = '';
    await this.presentToast('Tarea creada', 'success');
  }

  async toggleTask(taskId: string): Promise<void> {
    await this.store.toggleTask(taskId);
  }

  async deleteTask(taskId: string): Promise<void> {
    await this.store.deleteTask(taskId);
    await this.presentToast('Tarea eliminada', 'medium');
  }

  onCategoryFilterChange(value: string): void {
    this.selectedCategoryFilter = value;
    this.selectedCategoryFilter$.next(value);
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.searchTerm$.next(value);
  }

  openCreateCategoryModal(): void {
    this.editingCategoryId = null;
    this.categoryName = '';
    this.categoryColor = '#3880ff';
    this.categoryModalOpen = true;
  }

  openEditCategoryModal(category: Category): void {
    this.editingCategoryId = category.id;
    this.categoryName = category.name;
    this.categoryColor = category.color;
    this.categoryModalOpen = true;
  }

  closeCategoryModal(): void {
    this.categoryModalOpen = false;
  }

  async saveCategory(): Promise<void> {
    const name = this.categoryName.trim();
    if (!name) {
      await this.presentToast('El nombre de categoria es obligatorio', 'warning');
      return;
    }

    if (this.editingCategoryId) {
      await this.store.updateCategory(this.editingCategoryId, name, this.categoryColor);
      await this.presentToast('Categoria actualizada', 'success');
    } else {
      await this.store.addCategory(name, this.categoryColor);
      await this.presentToast('Categoria creada', 'success');
    }

    this.closeCategoryModal();
  }

  async confirmDeleteCategory(categoryId: string): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Eliminar categoria',
      message:
        'Al eliminar la categoria, las tareas asociadas quedaran sin categoria. ¿Deseas continuar?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.store.deleteCategory(categoryId);
            await this.presentToast('Categoria eliminada', 'medium');
          },
        },
      ],
    });

    await alert.present();
  }

  trackTask(_: number, task: TodoTask): string {
    return task.id;
  }

  trackCategory(_: number, category: Category): string {
    return category.id;
  }

  private async presentToast(message: string, color: 'success' | 'warning' | 'danger' | 'medium'): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 1800,
      position: 'bottom',
      color,
    });
    await toast.present();
  }
}
