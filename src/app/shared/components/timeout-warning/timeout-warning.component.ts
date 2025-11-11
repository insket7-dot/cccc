import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core'; // 引入 TranslateModule

@Component({
    selector: 'app-timeout-warning',
    standalone: true,
    imports: [MatDialogModule, MatButtonModule, AsyncPipe, TranslateModule],
    template: `
        <div class="wrap">
            <div class="icon"><img src="assets/image/tips _icon.png" /></div>
            <img class="bg" src="/assets/image/tipsbg.png" />

            <div class="content">
                <div class="title">Tip</div>
                <p class="text">{{ 'page.tip3' | translate : { time: countdown$ | async } }}</p>
            </div>
        </div>
    `,
    styles: [
        `
            .wrap {
                width: 300px;
                height: 250px;

                .icon {
                    position: absolute;
                    left: 50%;
                    top: -72px;
                    transform: translateX(-50%);
                    width: 130px;
                    height: 130px;
                    img {
                        width: 100%;
                        height: 100%;
                    }
                }

                .bg {
                    width: 100%;
                    height: 40%;
                }

                .title {
                    font-size: 18px;
                    text-align: center;
                }
                .text {
                    padding: 10px;
                    font-size: 14px;
                }
            }
        `,
    ],
})
export class TimeoutWarningComponent {
    countdown$: Observable<number>;

    constructor(@Inject(MAT_DIALOG_DATA) public data: { countdown: Observable<number> }) {
        this.countdown$ = data.countdown;
    }

    onContinue() {
        window.dispatchEvent(new Event('click'));
    }
}
