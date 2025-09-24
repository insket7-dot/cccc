import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { LocalStorage } from '@rydeen/angular-framework';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatChipsModule],
  templateUrl: './menu.html',
  styleUrl: './menu.scss'
})
export class Menu implements OnInit {
  protected readonly items = signal<Array<{ id: string; name: string; category: string; price: number; tags?: string[] }>>([]);

  async ngOnInit(): Promise<void> {
    const byId = await LocalStorage.getItem<Record<string, any>>('menu.byId', 'menu');
    if (byId) {
      const all = Object.entries(byId).map(([id, v]: [string, any]) => ({ id, ...(v || {}) }));
      // 简单排序：按品类分组后按名称
      all.sort((a, b) => (a.category || '').localeCompare(b.category || '') || (a.name || '').localeCompare(b.name || ''));
      this.items.set(all);
    } else {
      this.items.set([]);
    }
  }
}
