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

    importProvidersFrom(MatToolbarModule, MatButtonModule),

    provideApollo(() => {
      const httpLink = createHttpLink({
        uri: environment.graphqlUri, // '/graphql' via proxy
        fetch,
      });

      // ✅ Typage safe: on prend err en any (évite ErrorHandlerOptions)
      const errorLink = onError((err: any) => {
        const networkError = err?.networkError;
        const graphQLErrors = err?.graphQLErrors;

        if (networkError) console.error('Network error', networkError);
        if (graphQLErrors?.length) console.error('GraphQL errors', graphQLErrors);
      });

      // ✅ TS strict: ctx['headers'] au lieu de ctx.headers
      const authLink = setContext((_, ctx: any) => {
        const token = getToken();
        const prevHeaders = (ctx?.['headers'] ?? {}) as Record<string, string>;

        return {
          headers: {
            ...prevHeaders,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        };
      });

      return {
        link: ApolloLink.from([errorLink, authLink, httpLink]),
        cache: new InMemoryCache(),
      };
    }),
  ],
};
