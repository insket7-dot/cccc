// toast.service.ts
import { Component, Inject, Injectable } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
    MAT_DIALOG_DATA,
    MatDialog,
    MatDialogModule,
    MatDialogRef,
} from '@angular/material/dialog';
import { ConfirmListener, MessageOptions, MessageParam } from '@rydeen/angular-framework';
import { firstValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';

@Injectable({ providedIn: 'root' })
export class ToastService {
    constructor(
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
        private translate: TranslateService,
    ) {}

    private resolveMessage(message: string, options?: MessageOptions): string {
        if (!options) return message;
        const key = options.messageKey ?? (options.isKey ? message : undefined);
        return key ? this.translate.instant(key, options.params) : message;
    }

    private snackPosition(options?: MessageOptions): {
        verticalPosition: 'top' | 'bottom';
        horizontalPosition: 'start' | 'center' | 'end' | 'left' | 'right';
    } {
        const pos = options?.position ?? 'bottom';
        return {
            verticalPosition: pos === 'top' ? 'top' : 'bottom',
            horizontalPosition: 'center',
        };
    }

    private openSnack(message: string, options?: MessageOptions, panelClass?: string): void {
        const text = this.resolveMessage(message, options);
        const position = this.snackPosition(options);
        this.snackBar.open(text, undefined, {
            duration: 3000,
            panelClass: panelClass ? [panelClass] : undefined,
            ...position,
        });
    }

    // 暴露公共方法
    info(message: string, options?: MessageOptions): Promise<void> {
        this.openSnack(message, options, 'mat-elevation-z2');
        return Promise.resolve();
    }

    error(message: string, options?: MessageOptions): Promise<void> {
        this.openSnack(message, options, 'mat-warn');
        return Promise.resolve();
    }

    warn(message: string, options?: MessageOptions): Promise<void> {
        this.openSnack(message, options, 'mat-accent');
        return Promise.resolve();
    }

    success(message: string, options?: MessageOptions): Promise<void> {
        this.openSnack(message, options, 'mat-primary');
        return Promise.resolve();
    }

    async confirm(
        messageId: string,
        messageParams?: MessageParam,
        confirmListener?: ConfirmListener,
    ): Promise<void> {
        const message = this.translate.instant(messageId, messageParams);
        const ref = this.dialog.open(ConfirmDialogComponent, {
            data: { message },
            disableClose: true,
        });
        const result = await firstValueFrom(ref.afterClosed());
        const ok = !!result;
        if (confirmListener) {
            await confirmListener({ role: ok ? 'ok' : 'cancel', data: ok });
        }
    }
}

@Component({
    selector: 'app-confirm-dialog',
    standalone: true,
    imports: [MatDialogModule, MatButtonModule, TranslateModule],
    template: `
        <h2 mat-dialog-title>{{ data.message }}</h2>
        <div mat-dialog-actions style="justify-content: flex-end; gap: 8px;">
            <button mat-button (click)="onCancel()">{{ 'app.common.cancel' | translate }}</button>
            <button mat-flat-button color="primary" (click)="onOk()">
                {{ 'app.common.confirm' | translate }}
            </button>
        </div>
    `,
})
export class ConfirmDialogComponent {
    constructor(
        private dialogRef: MatDialogRef<ConfirmDialogComponent, boolean>,
        @Inject(MAT_DIALOG_DATA) public data: { message: string },
    ) {}

    onCancel() {
        this.dialogRef.close(false);
    }

    onOk() {
        this.dialogRef.close(true);
    }
}
