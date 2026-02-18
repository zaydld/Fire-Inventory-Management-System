import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginPageComponent } from './login.page';
import { Apollo } from 'apollo-angular';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';

// ✅ ngx-translate test setup
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

class FakeLoader implements TranslateLoader {
  getTranslation() {
    return of({}); // aucune traduction nécessaire pour le test
  }
}

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;

  const apolloMock = { mutate: jest.fn() };
  const routerMock = { navigateByUrl: jest.fn() };
  const snackMock = { open: jest.fn() };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        LoginPageComponent,

        // ✅ Fournit TranslateService + translate pipe
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
      providers: [
        { provide: Apollo, useValue: apolloMock },
        { provide: Router, useValue: routerMock },
        { provide: MatSnackBar, useValue: snackMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form when empty', () => {
    expect(component.form.valid).toBe(false);
  });

  it('should validate form when filled', () => {
    component.form.setValue({
      username: 'admin',
      password: '1234',
    });
    expect(component.form.valid).toBe(true);
  });

  it('should call login mutation on submit', () => {
    component.form.setValue({
      username: 'admin',
      password: '1234',
    });

    apolloMock.mutate.mockReturnValue(
      of({
        data: {
          login: {
            token: 'fake-token',
            user: { id: '1', username: 'admin', role: 'ADMIN' },
          },
        },
      })
    );

    component.submit();
    expect(apolloMock.mutate).toHaveBeenCalled();
  });
});
