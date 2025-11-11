import { Injectable, NgZone } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { takeUntil, tap, filter as rxFilter } from 'rxjs/operators';
import { TimeoutWarningComponent } from '@app/shared/components/timeout-warning/timeout-warning.component';

@Injectable({ providedIn: 'root' })
export class IdleTimeoutService {
    // 无操作超时时间(ms)
    private readonly IDLE_TIMEOUT = 60 * 1000;
    // 倒计时时间(ms)
    private readonly COUNTDOWN_TIME = 30 * 1000;

    private idleTimer: any;
    private countdownTimer$?: Observable<number>;
    private countdownSubscription: any;
    private countdown = new BehaviorSubject<number>(0);
    private dialogRef: any;

    // 用于检测是否正在倒计时
    isCountingDown = new BehaviorSubject<boolean>(false);

    constructor(
        private dialog: MatDialog,
        private router: Router,
        private ngZone: NgZone,
    ) {
        let isScreenPage = false;
        this.router.events
            .pipe(rxFilter((event) => event instanceof NavigationEnd))
            .subscribe((event: NavigationEnd) => {
                // 检查当前路由是否为screen页面
                console.log('NavigationEnd Url', event.url);
                const cleanUrl = event.url.replace(/^\/#/, '');
                isScreenPage = ['/', '/screen', '/login'].includes(cleanUrl);
                if (!isScreenPage && !this.countdownTimer$) {
                    this.countdownTimer$ = timer(0, 1000).pipe(
                        tap((value) => {
                            const remaining = Math.floor(this.COUNTDOWN_TIME / 1000) - value;
                            this.countdown.next(remaining);

                            if (remaining <= 0) {
                                this.navigateToScreenPage();
                            }
                        }),
                    );
                }
            });
    }

    // 启动空闲检测
    startMonitoring() {
        this.resetTimer();

        // 监听用户交互事件
        this.ngZone.runOutsideAngular(() => {
            window.addEventListener('click', () => this.resetTimer());
            window.addEventListener('keydown', () => this.resetTimer());
            window.addEventListener('mousemove', () => this.resetTimer());
            window.addEventListener('scroll', () => this.resetTimer());
        });
    }

    // 重置空闲计时器
    private resetTimer() {
        // 如果正在倒计时，关闭倒计时和对话框
        if (this.isCountingDown.value) {
            this.stopCountdown();
            this.dialogRef?.close();
        }

        // 清除现有计时器并重新设置
        clearTimeout(this.idleTimer);
        this.idleTimer = setTimeout(() => {
            this.ngZone.run(() => this.showTimeoutWarning());
        }, this.IDLE_TIMEOUT);
    }

    // 显示超时警告并开始倒计时
    private showTimeoutWarning() {
        if (!this.countdownTimer$) return;

        this.isCountingDown.next(true);

        // 创建超时提醒对话框
        this.dialogRef = this.dialog.open(TimeoutWarningComponent, {
            width: '300px',
            disableClose: true,
            backdropClass: 'timeout-backdrop',
            data: {
                countdown: this.countdown.asObservable(),
            },
        });

        // 开始倒计时
        this.countdownSubscription = this.countdownTimer$
            .pipe(takeUntil(this.dialogRef.afterClosed()))
            .subscribe();

        // 对话框关闭时停止倒计时
        this.dialogRef.afterClosed().subscribe(() => {
            this.stopCountdown();
        });
    }

    // 停止倒计时
    private stopCountdown() {
        this.isCountingDown.next(false);
        this.countdownSubscription?.unsubscribe();
        this.countdown.next(0);
    }

    private navigateToScreenPage() {
        this.stopCountdown();
        this.dialogRef?.close();
        this.router.navigate(['/screen']).catch((error) => console.error(error));
    }
}
