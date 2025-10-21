import { LoginService } from './services/login.service';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractAppPage } from '@app/shared/abstracts/abstract.app.page';
import { TranslateModule } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { deviceState } from './constants/login.constants';
import { CacheKey } from '@app/shared/constants/cache.key';
import { ModelStateService } from '@app/core/services/model-state.service';
import { LocalStorage } from '@rydeen/angular-framework';

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
    ],
})
export class Login extends AbstractAppPage implements OnInit {
    private readonly modelStateService = inject(ModelStateService);

    loginForm: FormGroup;
    selectedEnvironment: 'production' | 'test' = 'test';

    deviceState = deviceState;

    currentState: deviceState = deviceState.BIND_DEVICE;

    constructor(
        private formBuilder: FormBuilder,
        private LoginService: LoginService,
    ) {
        super();
        this.loginForm = this.formBuilder.group({
            storeCode: ['', []],
            authCode: ['', []],
            password: ['', []],
        });
    }

    ngOnInit() {
        const queryParams = this.route.snapshot.queryParams;
        this.currentState = queryParams['state'] as deviceState;

        if (this.currentState === deviceState.BIND_DEVICE) {
            this.loginForm.get('storeCode')?.setValidators([Validators.required]);
            this.loginForm.get('authCode')?.setValidators([Validators.required]);
        }
        if (this.currentState === deviceState.LOGIN) {
            this.loginForm.get('password')?.setValidators([Validators.required]);
        }
    }

    async onSubmitHandler() {
        if (this.loginForm.valid) {
            if (this.currentState === deviceState.BIND_DEVICE) {
                const result: any = await this.LoginService.bingDevice({
                    storeCode: this.loginForm.value.storeCode.trim(),
                    authCode: this.loginForm.value.authCode.trim(),
                });
                if (result.data) {
                    await LocalStorage.setItem(CacheKey.DEVICE_ID, result.data);
                    this.modelStateService.setDeviceId(result.data);
                    this.router.navigate(['/screen'], {}).catch((error) => console.error(error));
                }
            }
        } else {
            Object.values(this.loginForm.controls).forEach((control) => {
                control.markAsTouched();
            });
        }
    }
}
