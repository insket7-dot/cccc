import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

export interface ConfirmDialogData {
    title?: string;
    message?: string;
    okText?: string;
    cancelText?: string;
}

@Component({
    selector: 'app-confirm-dialog',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, TranslateModule],
    template: `
        <h2 mat-dialog-title>
            {{ data.title || ('app.common.confirmTitle' | translate) }}
        </h2>
        <div mat-dialog-content>
            {{ data.message || ('app.common.confirmMessage' | translate) }}
        </div>
        <div mat-dialog-actions align="end">
            <button mat-button (click)="onCancel()">
                {{ data.cancelText || ('app.common.cancel' | translate) }}
            </button>
            <button mat-flat-button color="warn" (click)="onOk()">
                {{ data.okText || ('app.common.confirm' | translate) }}
            </button>
        </div>
    `,
})
export class ConfirmDialogComponent {
    constructor(
        private readonly dialogRef: MatDialogRef<ConfirmDialogComponent, boolean>,
        @Inject(MAT_DIALOG_DATA) public readonly data: ConfirmDialogData,
    ) {}

    onCancel(): void { this.dialogRef.close(false); }
    onOk(): void { this.dialogRef.close(true); }
}


