import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSelectorComponent } from '../language-selector/language-selector';
import { Url } from '@rydeen/angular-framework';

export interface NavigationItem {
  label: string;
  route: Url;
  icon?: string;
  active?: boolean;
}

export interface LayoutConfig {
  showToolbar?: boolean;
  showSidenav?: boolean;
  showLanguageSelector?: boolean;
  showScanButton?: boolean;
  toolbarTitle?: string;
  navigationItems?: NavigationItem[];
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatProgressSpinnerModule,
    RouterModule,
    TranslateModule,
    LanguageSelectorComponent
  ],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.scss'
})
export class AppLayoutComponent {
  @Input() config: LayoutConfig = {
    showToolbar: true,
    showSidenav: false,
    showLanguageSelector: true,
    showScanButton: true,
    toolbarTitle: 'cross-platform-app',
    navigationItems: []
  };

  @Input() loading = false;
  @Input() sidenavOpen = false;

  @Output() navigationClick = new EventEmitter<Url>();
  @Output() scanClick = new EventEmitter<void>();
  @Output() sidenavToggle = new EventEmitter<void>();

  onNavigationClick(route: Url): void {
    this.navigationClick.emit(route);
  }

  onScanClick(): void {
    this.scanClick.emit();
  }

  onSidenavToggle(): void {
    this.sidenavToggle.emit();
  }
}
