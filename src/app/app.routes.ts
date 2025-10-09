import { Routes } from '@angular/router';

/**
 * 页面路由动画列表
 * 格式：'离开页面,进入页面'
 */
export const animationPages = ['index,menu'];

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: '/home' },
    {
        path: 'home',
        loadComponent: () => import('./features/home/home').then((m) => m.Home),
        data: { animation: 'index' },
        pathMatch: 'full',
    },
    {
        path: 'menu',
        loadComponent: () => import('./features/menu/menu').then((m) => m.Menu),
        data: { animation: 'menu' },
    },
    {
        path: 'users',
        loadComponent: () => import('./features/users/users').then((m) => m.Users),
        data: { animation: 'users' },
    },
];
