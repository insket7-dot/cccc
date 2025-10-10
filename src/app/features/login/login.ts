import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractAppPage } from '../../shared/abstracts/abstract.app.page';
import { TranslateModule } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';



@Component({
    selector: 'app-login',
    styleUrls: ['./login.scss'],
    templateUrl: './login.html',
    imports: [TranslateModule,CommonModule,ReactiveFormsModule, MatInputModule,
    MatIconModule,
    MatRadioModule,
    MatButtonModule,],

})
export class Login extends AbstractAppPage implements OnInit {
loginForm: FormGroup;
  selectedEnvironment: 'production' | 'test' = 'test';


   constructor(private formBuilder: FormBuilder) {
    super();
    this.loginForm = this.formBuilder.group({
      storeCode: ['', [Validators.required, Validators.minLength(3)]],
      authCode: ['', [Validators.required, Validators.minLength(5)]]
    });
  }



  ngOnInit() {
  }


  onSubmitHandler() {
    if (this.loginForm.valid) {
      console.log('表单提交数据：', this.loginForm.value);
      console.log('选择的环境：', this.selectedEnvironment);
    } else {
      // 标记所有表单控件为已触摸，显示校验错误
      Object.values(this.loginForm.controls).forEach(control => {
        control.markAsTouched();
      });
    }
  }

}
