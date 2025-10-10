import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-timeout-warning',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, AsyncPipe],
  template: `
    <h2 mat-dialog-title>会话超时提醒</h2>
    <mat-dialog-content>
      <p>您已长时间未操作，将在 {{ countdown$ | async }} 秒后返回首页。</p>
      <p>点击任意位置继续使用。</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button color="primary" (click)="onContinue()">继续使用</button>
    </mat-dialog-actions>
  `
})
export class TimeoutWarningComponent {
  countdown$: Observable<number>;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { countdown: Observable<number> }) {
    this.countdown$ = data.countdown;
  }

  onContinue() {
    // 关闭对话框将触发计时器重置
    window.dispatchEvent(new Event('click'));
  }
}
