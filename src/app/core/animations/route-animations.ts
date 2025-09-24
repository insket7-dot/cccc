import {
    animate,
    animateChild,
    AnimationMetadata,
    group,
    query,
    style,
    transition,
    trigger
} from '@angular/animations';
import {animationPages} from "../../app.routes";

/**
 * 执行动画
 * @param enterTransform 进入样式
 * @param leaveTransform 离开样式
 */
const execAnimation = (enterTransform: any, leaveTransform: any) => {
    return [
        style({ position: 'relative' }),
        query(':enter, :leave', [
            style({
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%'
            })
        ]),
        query(':enter', [style({ transform: enterTransform })], { optional: true }),
        query(':leave', animateChild(), { optional: true }),
        group([
            query(':leave', [animate('300ms ease-out', style({ transform: leaveTransform }))], { optional: true }),
            query(':enter', [animate('300ms ease-out', style({ transform: 'translateX(0)' }))], { optional: true })
        ]),
        query(':enter', animateChild())
    ];
};

/**
 * 创建动画定义列表
 */
export const getDefinitions = (): AnimationMetadata[] => {
    const definitions: AnimationMetadata[] = [];
    animationPages.forEach(page => {
        const [enter, leave] = page.split(',');
        definitions.push(
            transition(`${enter} => ${leave}`, execAnimation('translateX(100%)', 'translateX(-100%)')),
            transition(`${leave} => ${enter}`, execAnimation('translateX(-100%)', 'translateX(100%)'))
        );
    });
    return definitions;
};

/**
 * 创建动画触发器
 */
export const triggerAnimation = trigger('routeAnimations', getDefinitions());
