Need .env file with postgres password
DB_PASS=''
COOKIE_NAME=''

backend:
yarn watch
yarn dev

frontend:
yarn dev

disable CORS in chrome: https://stackoverflow.com/questions/35588699/response-to-preflight-request-doesnt-pass-access-control-check

yarn gen (in web to generate graphql code after adding to src/graphql/(e.g mutations)/)

if data needs to be find by google or sso, use server side rendering so the queries need that info. e.g posts.
