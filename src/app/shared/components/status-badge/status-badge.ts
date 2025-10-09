import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';

export type StatusType = 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled' | 'error';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule, MatChipsModule, MatTooltipModule, TranslateModule],
  template: `
    <mat-chip 
      [class]="'status-badge ' + size" 
      [color]="statusConfig.color"
      [matTooltip]="statusConfig.label | translate">
      {{ statusConfig.label | translate }}
    </mat-chip>
  `,
  styles: [`
    .status-badge {
      &.small {
        font-size: 12px;
        height: 24px;
        min-height: 24px;
      }

      &.medium {
        font-size: 14px;
        height: 28px;
        min-height: 28px;
      }

      &.large {
        font-size: 16px;
        height: 32px;
        min-height: 32px;
      }
    }
  `]
})
export class StatusBadgeComponent {
  @Input() status!: StatusType;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  get statusConfig() {
    const configs = {
      active: { label: 'app.status.active', color: 'primary' },
      inactive: { label: 'app.status.inactive', color: 'basic' },
      pending: { label: 'app.status.pending', color: 'accent' },
      completed: { label: 'app.status.completed', color: 'primary' },
      cancelled: { label: 'app.status.cancelled', color: 'warn' },
      error: { label: 'app.status.error', color: 'warn' }
    };
    return configs[this.status] || configs.inactive;
  }
}
