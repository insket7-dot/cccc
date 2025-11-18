import { LoginService } from './services/login.service';
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { AbstractAppPage } from '@app/shared/abstracts/abstract.app.page';
import { TranslateModule } from '@ngx-translate/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { DeviceStateEnum } from '@/app/shared/constants/login.constants';
import { CacheKey } from '@app/shared/constants/cache.key';
import { ModelStateService } from '@app/shared/services/model-state.service';
import { LocalStorage } from '@rydeen/angular-framework';
import { AppUrlService } from '@app/shared/services/app.url.service';

@Component({
    selector: 'app-login',
    styleUrls: ['./login.scss'],
    templateUrl: './login.html',
    imports: [
        TranslateModule,
        CommonModule,
        ReactiveFormsModule,
        MatInputModule,
        MatIconModule,
        MatRadioModule,
        MatButtonModule,
        NgOptimizedImage,
    ],
})
export class Login extends AbstractAppPage implements OnInit {
    private readonly modelStateService = inject(ModelStateService);

    loginForm: FormGroup;
    deviceState = DeviceStateEnum;
    currentState = signal<DeviceStateEnum>(DeviceStateEnum.BIND_DEVICE);

    constructor(
        private fb: NonNullableFormBuilder,
        private LoginService: LoginService,
        private readonly appUrlService: AppUrlService,
    ) {
        super();
        this.loginForm = this.fb.group(
            {
                storeCode: this.fb.control('', [Validators.minLength(5), Validators.maxLength(30)]),
                authCode: this.fb.control('', [Validators.minLength(8), Validators.maxLength(8)]),
                password: this.fb.control('', [Validators.minLength(6), Validators.maxLength(30)]),
            },
            { updateOn: 'blur' },
        );
    }

    ngOnInit() {
        const queryParams = this.route.snapshot.queryParams;
        this.currentState.set(queryParams['state'] as DeviceStateEnum);

        if (this.currentState() === DeviceStateEnum.BIND_DEVICE) {
            this.loginForm.controls['storeCode'].addValidators([Validators.required]);
            this.loginForm.controls['authCode'].addValidators([Validators.required]);
        }
        if (this.currentState() === DeviceStateEnum.LOGIN) {
            this.loginForm.controls['password'].addValidators([Validators.required]);
        }
    }

    async onSubmitHandler() {
        if (this.loginForm.valid) {
            if (this.currentState() === DeviceStateEnum.BIND_DEVICE) {
                const result = await this.LoginService.bingDevice({
                    storeCode: this.loginForm.value.storeCode.trim(),
                    authCode: this.loginForm.value.authCode.trim(),
                });
                if (result.data) {
                    await LocalStorage.setItem(CacheKey.DEVICE_ID, result.data);
                    this.modelStateService.setDeviceId(result.data);
                    this.router
                        .navigate([this.appUrlService.getPageUrlValue('PAGE_SCREEN')], {})
                        .catch((error) => console.error(error));
                } else {
                    this.error(result.msg);
                }
            }
        } else {
            Object.values(this.loginForm.controls).forEach((control) => {
                control.markAsTouched();
            });
        }
    }

    async resetConfig() {
        try {
            await LocalStorage.clear();

            this.modelStateService.clearUserSelectState();

            this.router
                .navigate([this.appUrlService.getPageUrlValue('PAGE_LOGIN')], {
                    queryParams: { state: DeviceStateEnum.BIND_DEVICE },
                })
                .catch((error) => console.error(error));

                this.currentState.set(DeviceStateEnum.BIND_DEVICE)
        } catch (error) {
            this.error('清除设置失败，请重试');
        }
    }
}
