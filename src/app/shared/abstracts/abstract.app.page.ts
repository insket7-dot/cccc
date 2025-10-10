import {
    AbstractComponent,
    ConfirmListener,
    EventManager,
    MessageOptions,
    MessageParam,
} from '@rydeen/angular-framework';
import { Component, inject, Inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
    MAT_DIALOG_DATA,
    MatDialog,
    MatDialogModule,
    MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

// =============== 事件类型与接口定义 ===============
export type UiEventType = 'click' | 'change' | 'submit' | 'custom';
export interface UiEvent {
    type: UiEventType;
    key: string; // 来自 data-id
    payload?: unknown; // change/submit 的值或表单对象
    originalEvent: Event; // 原始事件对象
}
export type UiEventHandler = (ev: UiEvent) => Promise<void> | void;

/**
 * 页面抽象基类（此为当前工程的页面基类，所有页面都需要继承该抽象父类）
 *
 * @author richie696
 * @version 1.0
 * @since 2025/10/05
 */
export abstract class AbstractAppPage extends AbstractComponent {
    private readonly snackBar = inject(MatSnackBar);
    protected readonly dialog = inject(MatDialog);
    protected readonly eventManager: EventManager = inject(EventManager);

    // ==================== 统一 UI 事件分发（可选使用） ====================
    /** 支持的 UI 事件类型 */
    public static readonly UI_EVENT_TYPES = ['click', 'change', 'submit'] as const;
    /**
     * 元素上使用 data-id 提供唯一标识，如：users.saveBtn / menu.searchInput
     */
    private readonly uiEventHandlers: Map<string, UiEventHandler> = new Map();

    /** 在模板统一绑定：(click)="onClick($event)" */
    public onClick(event: Event): void {
        this.handleUiEvent('click', event).catch((error) => console.error(error));
    }

    /** 在模板统一绑定：(change)="onChange($event)" */
    public onChange(event: unknown): void {
        this.handleUiEvent('change', event).catch((error) => console.error(error));
    }

    /** 在模板统一绑定：(ngSubmit)="onSubmit($event)" 或 (submit)="onSubmit($event)" */
    public onSubmit(event: unknown): void {
        this.handleUiEvent('submit', event).catch((error) => console.error(error));
    }

    /** 页面代码中注册/卸载处理器（建议在 ngOnInit 中注册） */
    public registerHandler(key: string, handler: UiEventHandler): void {
        this.uiEventHandlers.set(key, handler);
    }

    public unregisterHandler(key: string): void {
        this.uiEventHandlers.delete(key);
    }

    /** 提供可覆写的前置/后置钩子 */
    // 返回 false 可拦截后续分发（如权限、节流、防抖等）
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected async preDispatch(_ev: UiEvent): Promise<boolean> {
        return true;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected async postDispatch(_ev: UiEvent): Promise<void> {
        /* no-op */
    }

    private async handleUiEvent(type: UiEventType, event: unknown): Promise<void> {
        const key = this.findElementKey(event as Event);
        if (!key) {
            return;
        }

        const payload = this.extractPayload(type, event as Event);
        const uiEvent: UiEvent = { type, key, payload, originalEvent: event as Event };

        if (!(await this.preDispatch(uiEvent))) {
            return;
        }
        try {
            const handler = this.uiEventHandlers.get(key);
            if (handler) {
                await handler(uiEvent);
            }
        } finally {
            await this.postDispatch(uiEvent);
        }
    }

    private findElementKey(event: Event): string | null {
        // 优先使用 currentTarget 以兼容 PointerEvent 等
        const current = (event as any)?.currentTarget as Element | undefined;
        if (current) {
            const key = this.lookupDataId(current);
            if (key) return key;
        }

        // 原生 target
        const fromTarget = (event as any)?.target as Element | null | undefined;
        if (fromTarget) {
            const key = this.lookupDataId(fromTarget);
            if (key) return key;
        }

        // Angular Material 某些事件（如 MatDatepickerInputEvent）的 target 为指令实例
        const targetObj = (event as any)?.target as any | undefined;
        const nativeFromTargetRef: Element | undefined =
            targetObj?._elementRef?.nativeElement ||
            targetObj?.elementRef?.nativeElement ||
            targetObj?._hostElement?.nativeElement;
        if (nativeFromTargetRef) {
            const key = this.lookupDataId(nativeFromTargetRef);
            if (key) return key;
        }

        // Angular Material 变更事件（MatCheckboxChange / MatSelectChange 等）
        const source = (event as any)?.source as any | undefined;
        const nativeFromSource: Element | undefined =
            source?._elementRef?.nativeElement ||
            source?._elementRef?.elementRef?.nativeElement ||
            source?._hostElement?.nativeElement;
        if (nativeFromSource) {
            const key = this.lookupDataId(nativeFromSource);
            if (key) return key;
        }

        // 事件路径（有些浏览器/包装会保留 composedPath）
        const path = (event as any)?.composedPath?.() as Array<EventTarget> | undefined;
        if (Array.isArray(path)) {
            for (const n of path) {
                if (n && (n as any).dataset) {
                    const key = (n as any).dataset['id'];
                    if (key) return key;
                }
            }
        }

        // 退化：当前聚焦元素
        const active = (document?.activeElement as Element | null) ?? null;
        if (active) {
            const key = this.lookupDataId(active);
            if (key) return key;
        }

        return null;
    }

    private lookupDataId(el: Element): string | undefined {
        let node: Element | null = el;
        while (node) {
            const ds = (node as HTMLElement).dataset as
                | Record<string, string | undefined>
                | undefined;
            const maybe = ds ? ds['id'] : undefined;
            if (maybe) {
                return maybe;
            }
            node = node.parentElement;
        }
        return undefined;
    }

    private extractPayload(type: UiEventType, event: Event): unknown {
        // 尝试获取可用的原生元素（兼容 PointerEvent 与 Angular Material 事件）
        const current = (event as any)?.currentTarget as Element | undefined;
        const rawTarget = (event as any)?.target as Element | undefined;
        const source = (event as any)?.source as any | undefined;
        const nativeFromSource: Element | undefined =
            source?._elementRef?.nativeElement ||
            source?._elementRef?.elementRef?.nativeElement ||
            source?._hostElement?.nativeElement;
        const targetObj = (event as any)?.target as any | undefined;
        const nativeFromTargetRef: Element | undefined =
            targetObj?._elementRef?.nativeElement ||
            targetObj?.elementRef?.nativeElement ||
            targetObj?._hostElement?.nativeElement;
        const el: any =
            current ||
            rawTarget ||
            nativeFromTargetRef ||
            nativeFromSource ||
            (document?.activeElement as Element | null) ||
            undefined;
        switch (type) {
            case 'click': {
                const ds = el
                    ? (el.dataset as Record<string, string | undefined> | undefined)
                    : undefined;
                const userId = ds ? ds['userId'] : undefined;
                const name = (el && (el as any).name) ?? undefined;
                return { userId, name };
            }
            case 'change': {
                const ds = el
                    ? (el.dataset as Record<string, string | undefined> | undefined)
                    : undefined;
                // 支持多种 Angular Material 事件与原生事件
                const fromTargetValue = el && 'value' in el ? el.value : undefined;
                const fromEventValue = (event as any)?.value;
                const value = fromEventValue ?? fromTargetValue;
                const name = (el && el.name) ?? undefined;
                const checked = (el && el.checked) ?? (event as any)?.checked ?? undefined;
                const userId = ds ? ds['userId'] : undefined;
                const pageEvent = (event as any)?.pageIndex !== undefined ? event : undefined; // MatPaginator PageEvent
                return { value, name, checked, userId, pageEvent };
            }
            case 'submit': {
                const form = event.target as HTMLFormElement;
                if (form && typeof FormData !== 'undefined') {
                    const data = new FormData(form);
                    const obj: Record<string, any> = {};
                    data.forEach((v, k) => {
                        obj[k] = v;
                    });
                    return obj;
                }
                return undefined;
            }
            default:
                return undefined;
        }
    }

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
        horizontalPosition: 'start' | 'center' | 'end' | 'left' | 'right';
    } {
        const pos = options?.position ?? 'bottom';
        const verticalPosition = pos === 'top' ? 'top' : 'bottom';
        return { verticalPosition, horizontalPosition: 'center' };
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

    override async confirm(
        messageId: string,
        messageParams?: MessageParam,
        confirmListener?: ConfirmListener,
    ): Promise<void> {
        const message = this.translate.instant(messageId, messageParams);
        const ref = this.dialog.open(ConfirmDialogComponent, {
            data: { message },
            disableClose: true,
        });
        const result = await ref.afterClosed().toPromise();
        const ok = !!result;
        if (confirmListener) {
            await confirmListener({ role: ok ? 'ok' : 'cancel', data: ok });
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
