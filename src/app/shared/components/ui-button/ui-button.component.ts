import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'danger' | 'ghost' | 'outline' | 'success';
export type ButtonSize    = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-ui-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [class]="classes()"
      [disabled]="disabled() || loading()"
      [type]="type()"
      (click)="clicked.emit($event)">
      @if (loading()) {
        <span class="spinner"></span>
      }
      <ng-content />
    </button>
  `,
  styleUrl: './ui-button.component.scss',
})
export class UiButtonComponent {
  variant  = input<ButtonVariant>('primary');
  size     = input<ButtonSize>('md');
  disabled = input(false);
  loading  = input(false);
  type     = input<'button' | 'submit' | 'reset'>('button');
  fullWidth = input(false);

  clicked = output<MouseEvent>();

  classes() {
    return [
      'btn',
      `btn--${this.variant()}`,
      `btn--${this.size()}`,
      this.fullWidth() ? 'btn--full' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }
}
