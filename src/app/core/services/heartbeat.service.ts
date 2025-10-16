import { Injectable, OnDestroy } from '@angular/core';
import { interval, Subject, takeUntil } from 'rxjs';
import { AbstractAppService } from '../../shared/abstracts/abstract.app.service';
import { AppUrl } from '../../core/constants/app.url';

@Injectable({ providedIn: 'root' })
export class HeartbeatService extends AbstractAppService implements OnDestroy {
  private destroy$ = new Subject<void>();
  private readonly HEARTBEAT_INTERVAL = 60 * 1000;

  constructor() {
    super();
    this.startHeartbeat();
  }

  private startHeartbeat(): void {
    interval(this.HEARTBEAT_INTERVAL)
      .pipe(takeUntil(this.destroy$))
      .subscribe(async () => {
        try {
          await this.request(AppUrl.HEART_BEAT,);
        } catch (error) {
          console.error('心跳请求失败:', error);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
