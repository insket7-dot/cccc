import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { UserService } from './services/user.service';
import { UserModel } from '../../shared/types/user.shared.types';
import { MatDialogModule } from '@angular/material/dialog';
import { UserDialogComponent } from './components/user-dialog';
import { ConfirmDialogComponent } from './components/confirm-dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';
import { AbstractAppPage } from '../../shared/abstracts/abstract.app.page';
import { DateFormatPipe, DateTimeFormatPipe } from '../../shared/pipes/date-format.pipe';
import { UsersUi } from './types/users.types';

@Component({
    selector: 'app-users',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        MatTableModule,
        MatPaginatorModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        MatCheckboxModule,
        DateFormatPipe,
        DateTimeFormatPipe,
    ],
    templateUrl: './users.html',
    styleUrl: './users.scss',
})
export class Users extends AbstractAppPage implements OnInit {
    protected readonly UsersUi = UsersUi;
    protected readonly displayedColumns = [
        'select',
        'id',
        'name',
        'gender',
        'birthday',
        'email',
        'phone',
        'created_at',
        'actions',
    ];
    protected readonly data = signal<UserModel[]>([]);
    protected readonly selection = new SelectionModel<UserModel>(true, []);

    // filters
    protected keyword: string = '';
    protected gender: string | undefined;
    protected birthdayStart: string | undefined;
    protected birthdayEnd: string | undefined;

    // pagination
    protected length = 0; // 可选：如需要总数查询可扩展 COUNT *
    protected pageIndex = 0;
    protected pageSize = 10;
    protected pageSizeOptions = [5, 10, 20, 50];

    constructor(private readonly userService: UserService) {
        super();
    }

    async ngOnInit(): Promise<void> {
        console.log('Users component initialized, loading data...');

        // 等待数据库完全初始化
        await this.waitForDatabaseReady();

        await this.loadInitialData();
        await this.refresh();

        // 统一注册 UI 事件
        this.registerHandler(UsersUi.add, () => this.onAdd());
        this.registerHandler(UsersUi.batchDelete, () => this.onBatchDelete());
        this.registerHandler(UsersUi.resetFilters, () => this.onResetFilters());
        this.registerHandler(UsersUi.keyword, () => this.refresh());
        this.registerHandler(UsersUi.gender, () => this.refresh());
        this.registerHandler(UsersUi.birthdayStart, () => this.refresh());
        this.registerHandler(UsersUi.birthdayEnd, () => this.refresh());
        this.registerHandler(UsersUi.masterToggle, () => this.masterToggle());
        // 行切换：根据当前复选框状态与 row id 更新 selection
        this.registerHandler(UsersUi.rowToggle, (ev) => this.onRowToggleByPayload(ev));
        // 分页：从 payload.pageEvent 提取分页信息
        this.registerHandler(UsersUi.page, (ev) => this.onPageByPayload(ev));
        // 行级按钮：从事件 payload 中读取 userId
        this.registerHandler(UsersUi.edit, (ev) => this.onEditById((ev.payload as any)?.userId));
        this.registerHandler(UsersUi.delete, (ev) => this.onDeleteById((ev.payload as any)?.userId));
    }

    private async waitForDatabaseReady(): Promise<void> {
        console.log('Waiting for database to be ready...');
        let attempts = 0;
        const maxAttempts = 10;

        while (attempts < maxAttempts) {
            try {
                // 尝试查询数据库，如果成功说明数据库已准备好
                await this.userService.search({ page: 1, pageSize: 1 });
                console.log('Database is ready');
                return;
            } catch (error) {
                console.log(`Database not ready yet, attempt ${attempts + 1}/${maxAttempts}:`, error);
                attempts++;
                await new Promise(resolve => setTimeout(resolve, 500)); // 等待500ms后重试
            }
        }

        console.warn('Database may not be ready after maximum attempts');
    }

    async loadInitialData(): Promise<void> {
        try {
            // 先检查数据库中是否有数据
            const existingData = await this.userService.search({
                page: 1,
                pageSize: 1
            });

            console.log('Existing data count:', existingData.length);

            // 如果没有数据，添加一些测试数据
            if (existingData.length === 0) {
                console.log('No data found, adding test data...');
                const testUsers: UserModel[] = [
                    {
                        id: 'user-1',
                        name: '张三',
                        gender: 'male',
                        birthday: '1990-01-15',
                        email: 'zhangsan@example.com',
                        phone: '13800138001'
                    },
                    {
                        id: 'user-2',
                        name: '李四',
                        gender: 'female',
                        birthday: '1992-05-20',
                        email: 'lisi@example.com',
                        phone: '13800138002'
                    },
                    {
                        id: 'user-3',
                        name: '王五',
                        gender: 'male',
                        birthday: '1988-12-10',
                        email: 'wangwu@example.com',
                        phone: '13800138003'
                    },
                    {
                        id: 'user-4',
                        name: '赵六',
                        gender: 'female',
                        birthday: '1995-08-25',
                        email: 'zhaoliu@example.com',
                        phone: '13800138004'
                    },
                    {
                        id: 'user-5',
                        name: '钱七',
                        gender: 'other',
                        birthday: '1993-03-18',
                        email: 'qianqi@example.com',
                        phone: '13800138005'
                    }
                ];

                for (const user of testUsers) {
                    try {
                        await this.userService.create(user);
                        console.log('Created test user:', user.name);
                    } catch (error) {
                        console.error('Failed to create test user:', user.name, error);
                    }
                }
                console.log('Test data creation completed');
            }
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }

    async refresh(): Promise<void> {
        console.log('Users.refresh called with filters:', {
            keyword: this.keyword,
            gender: this.gender,
            start: this.birthdayStart,
            end: this.birthdayEnd,
            page: this.pageIndex + 1,
            pageSize: this.pageSize
        });

        const page = this.pageIndex + 1;
        const rows = await this.userService.search({
            keyword: this.keyword,
            gender: this.gender,
            start: this.birthdayStart,
            end: this.birthdayEnd,
            page,
            pageSize: this.pageSize,
        });

        console.log('Users.refresh received data:', rows);
        this.data.set(rows);
        console.log('Users.refresh data updated, current data length:', this.data().length);
    }

    async onPage(ev: PageEvent): Promise<void> {
        this.pageIndex = ev.pageIndex;
        this.pageSize = ev.pageSize;
        await this.refresh();
    }

    private async onPageByPayload(ev: any): Promise<void> {
        const pe: PageEvent | undefined = ev?.payload?.pageEvent;
        if (!pe) return;
        await this.onPage(pe);
    }

    private onRowToggleByPayload(ev: any): void {
        const userId: string | undefined = ev?.payload?.userId;
        if (!userId) return;
        const row = this.findRowById(userId);
        if (!row) return;
        // 切换选中状态
        if (this.selection.isSelected(row)) {
            this.selection.deselect(row);
        } else {
            this.selection.select(row);
        }
    }

    async onResetFilters(): Promise<void> {
        this.keyword = '';
        this.gender = undefined;
        this.birthdayStart = undefined;
        this.birthdayEnd = undefined;
        this.pageIndex = 0;
        await this.refresh();
    }

    async onAdd(): Promise<void> {
        const ref = this.dialog.open(UserDialogComponent, {
            data: { mode: 'create' },
            width: '720px',
        });
        const user = await ref.afterClosed().toPromise();
        if (user) {
            await this.userService.create(user);
            await this.refresh();
        }
    }

    async onEdit(u: UserModel): Promise<void> {
        const ref = this.dialog.open(UserDialogComponent, {
            data: { mode: 'edit', user: u },
            width: '720px',
        });
        const edited = await ref.afterClosed().toPromise();
        if (edited) {
            await this.userService.update(u.id, edited);
            await this.refresh();
        }
    }

    async onDelete(u: UserModel): Promise<void> {
        const ref = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: this.translate.instant('app.users.dialog.deleteTitle'),
                message: this.translate.instant('app.users.dialog.deleteMessage', { name: u.name }),
                okText: this.translate.instant('app.common.delete'),
                cancelText: this.translate.instant('app.common.cancel'),
            },
            width: '420px',
        });
        const ok = await ref.afterClosed().toPromise();
        if (!ok) return;
        await this.userService.remove(u.id);
        await this.refresh();
    }

    async onBatchDelete(): Promise<void> {
        if (this.selection.selected.length === 0) return;
        const ref = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: this.translate.instant('app.users.dialog.batchDeleteTitle'),
                message: this.translate.instant('app.users.dialog.batchDeleteMessage', { count: this.selection.selected.length }),
                okText: this.translate.instant('app.common.delete'),
                cancelText: this.translate.instant('app.common.cancel'),
            },
            width: '420px',
        });
        const ok = await ref.afterClosed().toPromise();
        if (!ok) return;
        const targets = this.selection.selected.slice();
        for (const u of targets) {
            await this.userService.remove(u.id);
        }
        this.selection.clear();
        await this.refresh();
    }

    private findRowById(id: string | undefined): UserModel | undefined {
        if (!id) return undefined;
        return this.data().find(x => x.id === id);
    }

    private async onEditById(id?: string): Promise<void> {
        const u = this.findRowById(id);
        if (!u) return;
        await this.onEdit(u);
    }

    private async onDeleteById(id?: string): Promise<void> {
        const u = this.findRowById(id);
        if (!u) return;
        await this.onDelete(u);
    }

    isAllSelected(): boolean {
        const numSelected = this.selection.selected.length;
        const numRows = this.data().length;
        return numSelected === numRows && numRows > 0;
    }

    masterToggle(): void {
        if (this.isAllSelected()) {
            this.selection.clear();
        } else {
            this.data().forEach((row) => this.selection.select(row));
        }
    }
}
