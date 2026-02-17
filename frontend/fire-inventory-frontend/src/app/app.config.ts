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

// ✅ ngx-translate v17 (standalone providers)
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),

    // ✅ requis pour loader http + le reste (Apollo etc.)
    provideHttpClient(),

    importProvidersFrom(MatToolbarModule, MatButtonModule),

    // ✅ ngx-translate (default EN + fichiers JSON)
    provideTranslateService({
      lang: 'en',
      fallbackLang: 'en',
      loader: provideTranslateHttpLoader({
        prefix: '/assets/i18n/',
        suffix: '.json',
      }),
    }),

    // ✅ Apollo
    provideApollo(() => {
      const httpLink = createHttpLink({
        uri: environment.graphqlUri, // '/graphql' via proxy
        fetch,
      });

      const errorLink = onError((err: any) => {
        if (err?.networkError) console.error('Network error', err.networkError);
        if (err?.graphQLErrors?.length) console.error('GraphQL errors', err.graphQLErrors);
      });

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
