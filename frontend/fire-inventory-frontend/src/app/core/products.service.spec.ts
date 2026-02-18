import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Apollo } from 'apollo-angular';
import {
  ProductsService,
  PRODUCTS_QUERY,
  CREATE_PRODUCT_MUTATION,
  UPDATE_PRODUCT_MUTATION,
  DELETE_PRODUCT_MUTATION,
} from './products.service';

describe('ProductsService (GraphQL)', () => {
  let service: ProductsService;

  const apolloMock = {
    query: jest.fn(),
    mutate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        ProductsService,
        { provide: Apollo, useValue: apolloMock },
      ],
    });

    service = TestBed.inject(ProductsService);
  });

  it('should call products query', () => {
    apolloMock.query.mockReturnValue(of({ data: { products: [] } }));

    service.getProducts().subscribe();

    expect(apolloMock.query).toHaveBeenCalledWith(
      expect.objectContaining({
        query: PRODUCTS_QUERY,
        fetchPolicy: 'network-only',
      })
    );
  });

  it('should call create mutation', () => {
    apolloMock.mutate.mockReturnValue(of({ data: { createProduct: { id: '1', name: 'P' } } }));

    service.createProduct({ name: 'P', description: null, price: 10, quantity: 2 }).subscribe();

    expect(apolloMock.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        mutation: CREATE_PRODUCT_MUTATION,
        variables: {
          input: { name: 'P', description: null, price: 10, quantity: 2 },
        },
        fetchPolicy: 'no-cache',
      })
    );
  });

  it('should call update mutation', () => {
    apolloMock.mutate.mockReturnValue(of({ data: { updateProduct: { id: '1', name: 'P2' } } }));

    service.updateProduct('1', { name: 'P2', description: null, price: 20, quantity: 3 }).subscribe();

    expect(apolloMock.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        mutation: UPDATE_PRODUCT_MUTATION,
        variables: {
          id: '1',
          input: { name: 'P2', description: null, price: 20, quantity: 3 },
        },
        fetchPolicy: 'no-cache',
      })
    );
  });

  it('should call delete mutation', () => {
    apolloMock.mutate.mockReturnValue(of({ data: { deleteProduct: true } }));

    service.deleteProduct('1').subscribe();

    expect(apolloMock.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        mutation: DELETE_PRODUCT_MUTATION,
        variables: { id: '1' },
        fetchPolicy: 'no-cache',
      })
    );
  });
});
