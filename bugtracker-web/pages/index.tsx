import type { NextPage } from 'next'
import { withUrqlClient } from 'next-urql';
import {NavBar} from "../src/components/NavBar"
import { usePostsQuery } from '../src/generated/graphql';
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
  const [{data}] = usePostsQuery();

return (
  <>
  <NavBar>
  <div>innehall i navbar, botten ska bort</div>
  </NavBar>
  <div>hello world ow</div>
  <br />
  {!data ? <div>loading...</div> : data.posts.map(p => <div key={p.id}>{p.title}</div>)}
  </>
)};

export default withUrqlClient(createUrqlClient)(Index);
