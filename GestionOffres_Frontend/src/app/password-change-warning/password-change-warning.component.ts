import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-password-change-warning',
  templateUrl: './password-change-warning.component.html',
  styleUrls: ['./password-change-warning.component.css']
})
export class PasswordChangeWarningComponent implements OnInit, OnChanges {
  @Input() userId!: string;
  @Input() remainingDays: number | null = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.checkPasswordChangeNecessity();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userId'] && !changes['userId'].firstChange) {
      this.checkPasswordChangeNecessity();
    }
    if (changes['remainingDays']) {
      this.remainingDays = changes['remainingDays'].currentValue;
    }
  }

  private checkPasswordChangeNecessity(): void {
    this.userService.checkPasswordChangeNecessity(this.userId).subscribe(
      (remainingDays: number) => {
        if (remainingDays >= 0) {
          this.remainingDays = remainingDays;
        }
      },
      (error) => {
        console.error('Error checking password change necessity', error);
      }
    );
  }
}
