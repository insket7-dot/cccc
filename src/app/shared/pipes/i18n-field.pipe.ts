import { Pipe, PipeTransform } from '@angular/core';
import { I18nTextService } from '@app/shared/services/i18n-text.service';

@Pipe({
    name: 'i18nField',
    standalone: true,
    pure: false,
})
export class I18nFieldPipe implements PipeTransform {
    constructor(private i18nTextService: I18nTextService) {}

    transform(obj: any, baseKey: string): string {
        return this.i18nTextService.get(obj, baseKey);
    }
}
