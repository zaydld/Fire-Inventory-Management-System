import { TestBed, fakeAsync, flush } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { Apollo } from 'apollo-angular';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ProductEditPageComponent } from './product-edit.page';

describe('ProductEditPageComponent', () => {
  let apolloMock: { query: jest.Mock; mutate: jest.Mock };
  let snackMock: { open: jest.Mock; openFromComponent: jest.Mock };

  beforeEach(async () => {
    apolloMock = { query: jest.fn(), mutate: jest.fn() };
    snackMock = { open: jest.fn(), openFromComponent: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        ProductEditPageComponent,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: Apollo, useValue: apolloMock },
        { provide: MatSnackBar, useValue: snackMock },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '123' }) } },
        },
      ],
    }).compileComponents();

    // ✅ traductions pour éviter d’avoir les keys dans le DOM
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', {
      PRODUCT: {
        EDIT: { TITLE: 'Edit Product' },
        NOT_FOUND: 'Product not found',
      },
      COMMON: { BACK: 'Back', SAVE: 'Save', SAVING: 'Saving...', LOADING: 'Loading...' },
      SNACK: {
        UPDATED_SUCCESS: 'Product updated successfully',
        UPDATE_FAILED: 'Update failed',
        LOAD_FAILED: 'Failed to load product',
      },
    });
    translate.setDefaultLang('en');
    translate.use('en');
  });

  it('should prefill form using productById', fakeAsync(() => {
    apolloMock.query.mockReturnValue(
      of({
        data: {
          productById: { id: '123', name: 'P1', description: 'D', price: 10, quantity: 5 },
        },
      })
    );

    const fixture = TestBed.createComponent(ProductEditPageComponent);
    fixture.detectChanges();
    flush();

    const component = fixture.componentInstance;
    expect(component.form.value.name).toBe('P1');
    expect(component.form.value.price).toBe(10);
    expect(component.form.value.quantity).toBe(5);
  }));

  it('should show "Product not found" when backend returns null', fakeAsync(() => {
    apolloMock.query.mockReturnValue(of({ data: { productById: null } }));

    const fixture = TestBed.createComponent(ProductEditPageComponent);
    fixture.detectChanges();
    flush();
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Product not found');
  }));

  it('should call update mutation and redirect on success', fakeAsync(() => {
    apolloMock.query.mockReturnValue(
      of({
        data: {
          productById: { id: '123', name: 'P1', description: '', price: 10, quantity: 5 },
        },
      })
    );

    apolloMock.mutate.mockReturnValue(
      of({ data: { updateProduct: { id: '123', name: 'P1 updated' } } })
    );

    const fixture = TestBed.createComponent(ProductEditPageComponent);
    fixture.detectChanges();
    flush();

    const router = TestBed.inject(Router);
    const navSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true as any);

    const component = fixture.componentInstance;
    component.form.patchValue({ name: 'P1 updated', price: 20, quantity: 7 });

    component.submit();
    flush();

    expect(apolloMock.mutate).toHaveBeenCalledTimes(1);
    expect(navSpy).toHaveBeenCalledWith(['/products']); // ✅ comportement principal
  }));

  it('should NOT redirect on update error', fakeAsync(() => {
    apolloMock.query.mockReturnValue(
      of({
        data: {
          productById: { id: '123', name: 'P1', description: '', price: 10, quantity: 5 },
        },
      })
    );

    apolloMock.mutate.mockReturnValue(throwError(() => new Error('Update error')));

    const fixture = TestBed.createComponent(ProductEditPageComponent);
    fixture.detectChanges();
    flush();

    const router = TestBed.inject(Router);
    const navSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true as any);

    fixture.componentInstance.form.patchValue({ name: 'P1', price: 10, quantity: 5 });
    fixture.componentInstance.submit();
    flush();

    expect(apolloMock.mutate).toHaveBeenCalledTimes(1);
    expect(navSpy).not.toHaveBeenCalled(); // ✅ pas de redirect en erreur
  }));
});
