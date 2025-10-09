// Users 模块 UI 常量：统一维护 data-id，避免魔法字符串
export const UsersUi = {
    add: 'users.add',
    batchDelete: 'users.batchDelete',
    resetFilters: 'users.resetFilters',
    keyword: 'users.keyword',
    gender: 'users.gender',
    birthdayStart: 'users.birthdayStart',
    birthdayEnd: 'users.birthdayEnd',
    masterToggle: 'users.masterToggle',
    rowToggle: 'users.rowToggle',
    edit: 'users.edit',
    delete: 'users.delete',
    page: 'users.page',
    dialogSubmit: 'users.dialog.submit',
    dialogCancel: 'users.dialog.cancel',
    dialogBirthday: 'users.dialog.birthday',
} as const;

export type UsersUiKey = keyof typeof UsersUi;

