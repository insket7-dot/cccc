import {
    AbstractComponent,
    ConfirmListener,
    EventManager,
    MessageOptions,
    MessageParam
} from '@rydeen/angular-framework';
import {Component, inject, Inject} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';


export abstract class AbstractPage extends AbstractComponent {

    private readonly snackBar = inject(MatSnackBar);
    private readonly dialog = inject(MatDialog);
    protected readonly eventManager: EventManager = inject(EventManager);

    private resolveMessage(message: string, options?: MessageOptions): string {
        if (!options) {
            return message;
        }
        const key = options.messageKey ?? (options.isKey ? message : undefined);
        if (key) {
            return this.translate.instant(key, options.params);
        }
        return message;
    }

    private snackPosition(options?: MessageOptions): {
        verticalPosition: 'top' | 'bottom';
        horizontalPosition: 'start' | 'center' | 'end' | 'left' | 'right'
    } {
        const pos = options?.position ?? 'bottom';
        const verticalPosition = pos === 'top' ? 'top' : 'bottom';
        return {verticalPosition, horizontalPosition: 'center'};
    }

    private openSnack(message: string, options?: MessageOptions, panelClass?: string): void {
        const text = this.resolveMessage(message, options);
        const position = this.snackPosition(options);
        this.snackBar.open(text, undefined, {
            duration: 3000,
            panelClass: panelClass ? [panelClass] : undefined,
            ...position
        });
    }

    override info(message: string, options?: MessageOptions): Promise<void> {
        this.openSnack(message, options, 'mat-elevation-z2');
        return Promise.resolve();
    }

    override error(message: string, options?: MessageOptions): Promise<void> {
        this.openSnack(message, options, 'mat-warn');
        return Promise.resolve();
    }

    override warn(message: string, options?: MessageOptions): Promise<void> {
        this.openSnack(message, options, 'mat-accent');
        return Promise.resolve();
    }

    override success(message: string, options?: MessageOptions): Promise<void> {
        this.openSnack(message, options, 'mat-primary');
        return Promise.resolve();
    }

    override async confirm(messageId: string, messageParams?: MessageParam, confirmListener?: ConfirmListener): Promise<void> {
        const message = this.translate.instant(messageId, messageParams);
        const ref = this.dialog.open(ConfirmDialogComponent, {
            data: {message},
            disableClose: true
        });
        const result = await ref.afterClosed().toPromise();
        const ok = !!result;
        if (confirmListener) {
            await confirmListener({role: ok ? 'ok' : 'cancel', data: ok});
        }
    }
}

@Component({
    selector: 'app-confirm-dialog',
    standalone: true,
    imports: [MatDialogModule, MatButtonModule],
    template: `
        <h2 mat-dialog-title>{{ data.message }}</h2>
        <div mat-dialog-actions style="justify-content: flex-end; gap: 8px;">
            <button mat-button (click)="onCancel()">取消</button>
            <button mat-flat-button color="primary" (click)="onOk()">确定</button>
        </div>
    `
})
export class ConfirmDialogComponent {
    constructor(
        private dialogRef: MatDialogRef<ConfirmDialogComponent, boolean>,
        @Inject(MAT_DIALOG_DATA) public data: { message: string }
    ) {
    }

    onCancel() {
        this.dialogRef.close(false);
    }

    onOk() {
        this.dialogRef.close(true);
    }
}
