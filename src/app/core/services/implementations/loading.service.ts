import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingIds = signal<Set<string>>(new Set());
  
  isLoading = computed(() => this.loadingIds().size > 0);
  loadingCount = computed(() => this.loadingIds().size);
  
  startLoading(id: string): void {
    this.loadingIds.update(ids => {
      ids.add(id);
      return new Set(ids);
    });
  }
  
  stopLoading(id: string): void {
    this.loadingIds.update(ids => {
      ids.delete(id);
      return new Set(ids);
    });
  }
  
  clearAll(): void {
    this.loadingIds.set(new Set());
  }
  
  getLoadingState(): boolean {
    return this.isLoading();
  }
}