import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';
import { Observable, map } from 'rxjs';

// ✅ Types
export type Product = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description?: string | null;
};

export type ProductInput = {
  name: string;
  description?: string | null;
  price: number;
  quantity: number;
};

export type ProductUpdateInput = {
  name?: string | null;
  description?: string | null;
  price?: number | null;
  quantity?: number | null;
};

// ✅ GraphQL docs
export const PRODUCTS_QUERY = gql`
  query Products {
    products {
      id
      name
      price
      quantity
    }
  }
`;

export const CREATE_PRODUCT_MUTATION = gql`
  mutation CreateProduct($input: ProductInput!) {
    createProduct(input: $input) {
      id
      name
      price
      quantity
    }
  }
`;

export const UPDATE_PRODUCT_MUTATION = gql`
  mutation UpdateProduct($id: String!, $input: ProductUpdateInput!) {
    updateProduct(id: $id, input: $input) {
      id
      name
      price
      quantity
    }
  }
`;

export const DELETE_PRODUCT_MUTATION = gql`
  mutation DeleteProduct($id: String!) {
    deleteProduct(id: $id)
  }
`;

@Injectable({ providedIn: 'root' })
export class ProductsService {
  constructor(private apollo: Apollo) {}

  // ✅ 1) products query
  

  // ✅ 2) create mutation
  createProduct(input: ProductInput): Observable<{ createProduct: Product }> {
    return this.apollo
      .mutate<{ createProduct: Product }>({
        mutation: CREATE_PRODUCT_MUTATION,
        variables: { input },
        fetchPolicy: 'no-cache',
      })
      .pipe(
        map((res) => {
          // res.data peut être undefined si erreur
          return { createProduct: res.data?.createProduct as Product };
        })
      );
  }

  // ✅ 3) update mutation
  updateProduct(id: string, input: ProductUpdateInput): Observable<{ updateProduct: Product }> {
    return this.apollo
      .mutate<{ updateProduct: Product }>({
        mutation: UPDATE_PRODUCT_MUTATION,
        variables: { id, input },
        fetchPolicy: 'no-cache',
      })
      .pipe(map((res) => ({ updateProduct: res.data?.updateProduct as Product })));
  }

  // ✅ 4) delete mutation
  deleteProduct(id: string): Observable<{ deleteProduct: boolean }> {
    return this.apollo
      .mutate<{ deleteProduct: boolean }>({
        mutation: DELETE_PRODUCT_MUTATION,
        variables: { id },
        fetchPolicy: 'no-cache',
      })
      .pipe(map((res) => ({ deleteProduct: !!res.data?.deleteProduct })));
  }
}
