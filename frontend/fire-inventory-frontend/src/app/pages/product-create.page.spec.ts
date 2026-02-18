import { TestBed, fakeAsync, flush } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { Apollo } from 'apollo-angular';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ProductCreatePageComponent } from './product-create.page';

describe('ProductCreatePageComponent', () => {
  let apolloMock: { mutate: jest.Mock };
  let snackMock: { open: jest.Mock; openFromComponent: jest.Mock };

  beforeEach(async () => {
    apolloMock = { mutate: jest.fn() };
    snackMock = { open: jest.fn(), openFromComponent: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        ProductCreatePageComponent,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: Apollo, useValue: apolloMock },
        { provide: MatSnackBar, useValue: snackMock },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({}) } },
        },
      ],
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', {
      PRODUCT: { CREATE: { TITLE: 'New Product' } },
      COMMON: { BACK: 'Back', CREATE: 'Create', CREATING: 'Creating...' },
      VALIDATION: {
        REQUIRED: 'This field is required',
        MIN_2: 'Minimum 2 characters',
        MIN_0: 'Must be ≥ 0',
      },
      SNACK: {
        CREATED_SUCCESS: 'Product created successfully',
        CREATE_FAILED: 'Create product failed',
      },
    });
    translate.setDefaultLang('en');
    translate.use('en');
  });

  it('should create component', () => {
    const fixture = TestBed.createComponent(ProductCreatePageComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show validation errors when submitting empty form', () => {
    const fixture = TestBed.createComponent(ProductCreatePageComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.submit();
    fixture.detectChanges();

    expect(component.form.invalid).toBe(true);

    const el: HTMLElement = fixture.nativeElement;
    const errors = Array.from(el.querySelectorAll('mat-error')).map((e) =>
      e.textContent?.trim()
    );
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should call create mutation and redirect on success', fakeAsync(() => {
    apolloMock.mutate.mockReturnValue(
      of({ data: { createProduct: { id: '1', name: 'P1' } } })
    );

    const fixture = TestBed.createComponent(ProductCreatePageComponent);
    fixture.detectChanges();
    flush();

    const router = TestBed.inject(Router);
    const navSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true as any);

    const component = fixture.componentInstance;
    component.form.patchValue({
      name: 'Product 1',
      description: '',
      price: 10,
      quantity: 2,
    });

    component.submit();
    flush();

    expect(apolloMock.mutate).toHaveBeenCalledTimes(1);
    expect(navSpy).toHaveBeenCalledWith(['/products']); // ✅ critère principal
  }));

  it('should NOT redirect on server error', fakeAsync(() => {
    apolloMock.mutate.mockReturnValue(
      throwError(() => new Error('Server error'))
    );

    const fixture = TestBed.createComponent(ProductCreatePageComponent);
    fixture.detectChanges();
    flush();

    const router = TestBed.inject(Router);
    const navSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true as any);

    const component = fixture.componentInstance;
    component.form.patchValue({
      name: 'Product 1',
      description: '',
      price: 10,
      quantity: 2,
    });

    component.submit();
    flush();

    expect(apolloMock.mutate).toHaveBeenCalledTimes(1);
    expect(navSpy).not.toHaveBeenCalled(); // ✅ pas de redirect en erreur
  }));
});
