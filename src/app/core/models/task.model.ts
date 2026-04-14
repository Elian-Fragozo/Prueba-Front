export interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface TodoTask {
  id: string;
  title: string;
  completed: boolean;
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;
}

