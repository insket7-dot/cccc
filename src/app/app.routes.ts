import { Routes } from '@angular/router';
import { AuthGuard } from '@/app/core/guards/device.guard';

/**
 * 页面路由动画列表
 * 格式：'离开页面,进入页面'
 */
export const animationPages = ['screen,index,menu'];

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: '/screen' },
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
        path: 'screen',
        loadComponent: () => import('./features/screen/screen').then((m) => m.Screen),
        data: { animation: 'screen' },
        canActivate: [AuthGuard]
    },
    {
        path: 'login',
        loadComponent: () => import('./features/login/login').then((m) => m.Login),
        data: { animation: 'screen' },
    },
];
