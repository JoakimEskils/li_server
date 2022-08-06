import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { createClient, dedupExchange, fetchExchange, Provider } from 'urql';
import { cacheExchange, Cache, QueryInput } from '@urql/exchange-graphcache';
import { LoginMutation, LogoutMutation, MeDocument, MeQuery, RegisterMutation } from "../src/generated/graphql";
import { createUrqlClient } from '../utils/createUrqlClient'

function MyApp({ Component, pageProps }: AppProps) {
  return (
      <Component {...pageProps} />
  );
}

export default MyApp
