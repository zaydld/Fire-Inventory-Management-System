import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  importProvidersFrom,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { environment } from '../environments/environment';

// Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';

// Apollo
import { ApolloLink, InMemoryCache } from '@apollo/client/core';
import { createHttpLink } from '@apollo/client/link/http';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { provideApollo } from 'apollo-angular';

// Token helper
import { getToken } from './core/auth-token';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),

    // ✅ Material modules used across the app
    importProvidersFrom(
      MatToolbarModule,
      MatButtonModule,
      MatFormFieldModule,
      MatInputModule,
      MatSnackBarModule,
      MatCardModule
    ),

    provideApollo(() => {
      const http = createHttpLink({
        uri: environment.graphqlUri,
        fetch,
      });

      const errorLink = onError((err: any) => {
        const networkError = err?.networkError;
        if (networkError) console.error('Network error', networkError);

        const graphQLErrors = err?.graphQLErrors;
        if (graphQLErrors?.length) console.error('GraphQL errors', graphQLErrors);
      });

      // ✅ US-7.2: attach JWT if exists
      const authLink = setContext((_, { headers }) => {
        const token = getToken();
        return {
          headers: {
            ...headers,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        };
      });

      return {
        link: ApolloLink.from([errorLink, authLink, http]),
        cache: new InMemoryCache(),
      };
    }),
  ],
};
