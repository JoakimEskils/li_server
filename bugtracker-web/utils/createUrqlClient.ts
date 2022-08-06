import { dedupExchange, fetchExchange, Provider } from 'urql';
import { cacheExchange } from '@urql/exchange-graphcache';
import { LoginMutation, LogoutMutation, MeDocument, MeQuery, RegisterMutation } from "../src/generated/graphql";
import { betterUpdateQuery } from './betterUpdateQuery';

export const createUrqlClient = (ssrExchange: any) => ({
    url: 'http://localhost:4000/graphql',
  fetchOptions: {
    credentials: "include" as const,
  },
  exchanges: [dedupExchange, cacheExchange({
    updates: {
      Mutation: {
        logout: (_result, args, cache, info) => {
            betterUpdateQuery<LogoutMutation, MeQuery>(
              cache, 
              {query: MeDocument},
              _result,
              () => ({ me: null })
            )
        },

        login: (_result, args, cache, info) => {
            betterUpdateQuery<LoginMutation, MeQuery>(
              cache, 
              {query: MeDocument},
              _result,
              (result, query) => {
                if (result.login.errors) {
                  console.log("oke")
                  return query
                } else {
                    console.log("blah")
                  return {
                    me: result.login.user
                  };
                }
              }
            )
        },

        register: (_result, args, cache, info) => {
            betterUpdateQuery<RegisterMutation, MeQuery>(
              cache, 
              {query: MeDocument},
              _result,
              (result, query) => {
                if (result.register.errors) {
                  return query
                } else {
                  return {
                    me: result.register.user
                  };
                }
              }
            )
        }
      }
    }
  }), ssrExchange, fetchExchange]
});