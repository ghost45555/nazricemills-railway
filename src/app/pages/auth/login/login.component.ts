import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService, LoginPayload } from '../../../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  showError = false;
  showPassword = false;
  redirectUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Check for redirect URL and email in query parameters
    this.route.queryParams.subscribe(params => {
      this.redirectUrl = params['redirect'] || params['returnUrl'] || null;
      const email = params['email'] || null;
      
      if (email) {
        this.loginForm.get('email')?.setValue(email);
      } else {
        // Check for remembered email
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
          this.loginForm.get('email')?.setValue(rememberedEmail);
          this.loginForm.get('rememberMe')?.setValue(true);
        }
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      // Mark all fields as touched to trigger validation display
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.showError = false;

    const loginData: LoginPayload = {
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value
    };

    this.authService.login(loginData).subscribe({
      next: (response) => {
        // Handle "remember me" option
        if (this.loginForm.get('rememberMe')?.value) {
          localStorage.setItem('rememberedEmail', loginData.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        // Handle redirection
        if (this.redirectUrl) {
          this.router.navigateByUrl(this.redirectUrl);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        this.showErrorMessage(error.error?.message || 'Invalid email or password');
      }
    });
  }

  showErrorMessage(message: string): void {
    this.errorMessage = message;
    this.showError = true;
  }
} 