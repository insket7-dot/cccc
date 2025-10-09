import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { UserModel } from "../../../shared/types/user.shared.types";
import { AbstractAppPage } from "../../../shared/abstracts/abstract.app.page";
import { UsersUi } from '../types/users.types';

export interface UserDialogData {
    mode: 'create' | 'edit';
    user?: UserModel;
}

@Component({
    selector: 'app-user-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        TranslateModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatButtonModule,
    ],
    template: `
        <h2 mat-dialog-title>
            {{
                data.mode === 'create'
                    ? ('app.users.dialog.add' | translate)
                    : ('app.users.dialog.edit' | translate)
            }}
        </h2>
        <form [formGroup]="form" class="dialog-form" mat-dialog-content [attr.data-id]="UsersUi.dialogSubmit" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" floatLabel="always">
                <mat-label>{{ 'app.users.form.name' | translate }}</mat-label>
                <input matInput formControlName="name" required />
            </mat-form-field>
            <mat-form-field appearance="outline" floatLabel="always">
                <mat-label>{{ 'app.users.form.gender' | translate }}</mat-label>
                <mat-select formControlName="gender">
                    <mat-option [value]="undefined">{{
                        'app.users.form.gender.placeholder' | translate
                    }}</mat-option>
                    <mat-option value="male">{{
                        'app.users.form.gender.male' | translate
                    }}</mat-option>
                    <mat-option value="female">{{
                        'app.users.form.gender.female' | translate
                    }}</mat-option>
                    <mat-option value="other">{{
                        'app.users.form.gender.other' | translate
                    }}</mat-option>
                </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" floatLabel="always">
                <mat-label>{{ 'app.users.form.birthday' | translate }}</mat-label>
                <input
                    matInput
                    [matDatepicker]="picker"
                    [value]="birthdayDate"
                    [attr.data-id]="UsersUi.dialogBirthday"
                    (dateChange)="onChange($event)"
                />
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>
            <mat-form-field appearance="outline" floatLabel="always">
                <mat-label>{{ 'app.users.form.email' | translate }}</mat-label>
                <input matInput formControlName="email" />
            </mat-form-field>
            <mat-form-field appearance="outline" floatLabel="always">
                <mat-label>{{ 'app.users.form.phone' | translate }}</mat-label>
                <input matInput formControlName="phone" />
            </mat-form-field>
        </form>
        <div mat-dialog-actions class="dialog-actions">
            <button mat-stroked-button mat-dialog-close [attr.data-id]="UsersUi.dialogCancel" (click)="onClick($event)">
                {{ 'app.common.cancel' | translate }}
            </button>
            <button mat-flat-button color="primary" [attr.data-id]="UsersUi.dialogSubmit" (click)="onClick($event)" [disabled]="form.invalid">
                {{ 'app.common.confirm' | translate }}
            </button>
        </div>
    `,
    styles: [
        `
            .dialog-form {
                display: grid;
                grid-template-columns: repeat(2, minmax(220px, 1fr));
                gap: 12px;
                margin-top: 8px; /* 与表头拉开距离 */
                padding-top: 20px !important; /* 内部上间距，避免贴紧标题 */
                align-items: start; /* 防止表单控件被拉伸为高块 */
            }
            .dialog-form mat-form-field {
                align-self: start;
                width: 100%;
            }
            .dialog-actions {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
                padding: 12px 24px;
            }
            .dialog-actions button {
                width: 100%;
                height: 48px;
            }
        `,
    ],
})
export class UserDialogComponent extends AbstractAppPage implements OnInit {
    public readonly form: FormGroup;
    protected readonly UsersUi = UsersUi;

    get birthdayDate(): Date | null {
        const v = (this.form.get('birthday') as any)?.value as string | undefined;
        if (!v) return null;
        // 避免時區導致的日期偏移：以本地年月日構造 Date
        const m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(v);
        if (m) {
            const y = Number(m[1]);
            const mm = Number(m[2]) - 1;
            const d = Number(m[3]);
            return new Date(y, mm, d);
        }
        // 兼容其它可解析格式
        return new Date(v);
    }

    constructor(
        private readonly fb: FormBuilder,
        private readonly dialogRef: MatDialogRef<UserDialogComponent, UserModel>,
        @Inject(MAT_DIALOG_DATA) public readonly data: UserDialogData,
    ) {
        super();
        this.form = this.fb.group({
            id: [''],
            name: ['', Validators.required],
            gender: [undefined as 'male' | 'female' | 'other' | undefined],
            birthday: [''],
            email: [''],
            phone: [''],
        });
        if (data?.user) {
            this.form.patchValue(data.user);
        }
        if (data?.mode === 'create' && !data.user) {
            const id = (globalThis as any).crypto?.randomUUID
                ? (globalThis as any).crypto.randomUUID()
                : this.generateUuidFallback();
            (this.form.get('id') as any)?.setValue(id as any);
        }
    }

    ngOnInit(): void {
        // 统一注册对话框内的事件处理
        this.registerHandler(UsersUi.dialogSubmit, () => this.onSubmit());
        this.registerHandler(UsersUi.dialogCancel, () => this.dialogRef.close());
        this.registerHandler(UsersUi.dialogBirthday, (ev) => this.onBirthdayByPayload(ev));
    }

    override onSubmit(): void {
        if (this.form.invalid) return;
        this.dialogRef.close(this.form.value as unknown as UserModel);
    }

    private onBirthdayByPayload(ev: any): void {
        // 支持 Angular Material (dateChange) 的事件值或原生 input 的 value
        const v = ev?.payload?.value;
        let iso: string = '';
        if (v instanceof Date) {
            iso = this.formatLocalDate(v); // 使用本地年月日，避免時區偏移
        } else if (typeof v === 'string') {
            // 可能是 yyyy-MM-dd 或可解析字符串
            const dt = new Date(v);
            iso = isNaN(dt.getTime()) ? '' : this.formatLocalDate(dt);
        } else if (v && typeof v === 'object' && 'toISOString' in v) {
            try { iso = this.formatLocalDate(v as Date); } catch { iso = ''; }
        }
        (this.form.get('birthday') as any)?.setValue(iso as any);
    }

    private formatLocalDate(d: Date): string {
        const y = d.getFullYear();
        const m = d.getMonth() + 1;
        const day = d.getDate();
        const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
        return `${y}-${pad(m)}-${pad(day)}`;
    }

    private generateUuidFallback(): string {
        // 优先尝试使用加密随机数构造 UUID v4
        const cryptoObj: any = (globalThis as any).crypto;
        if (cryptoObj?.getRandomValues) {
            const buf = new Uint8Array(16);
            cryptoObj.getRandomValues(buf);
            // Set version and variant bits
            buf[6] = (buf[6] & 0x0f) | 0x40;
            buf[8] = (buf[8] & 0x3f) | 0x80;
            const byteToHex: string[] = [];
            for (let i = 0; i < 256; ++i) byteToHex.push((i + 0x100).toString(16).substring(1));
            return (
                byteToHex[buf[0]] +
                byteToHex[buf[1]] +
                byteToHex[buf[2]] +
                byteToHex[buf[3]] +
                '-' +
                byteToHex[buf[4]] +
                byteToHex[buf[5]] +
                '-' +
                byteToHex[buf[6]] +
                byteToHex[buf[7]] +
                '-' +
                byteToHex[buf[8]] +
                byteToHex[buf[9]] +
                '-' +
                byteToHex[buf[10]] +
                byteToHex[buf[11]] +
                byteToHex[buf[12]] +
                byteToHex[buf[13]] +
                byteToHex[buf[14]] +
                byteToHex[buf[15]]
            );
        }
        // 兜底：时间戳 + 随机数（非加密）
        return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
    }
}
