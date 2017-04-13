import { gql, graphql, compose } from 'react-apollo';

const Posts = ({data})=>(<div>
  {data.allPosts ? data.allPosts.map((post, key)=>(<div key={key}>
    <a href={post.url}>{post.title}</a>
  </div>)) : <div>Loading</div>}
</div>);
  
export default compose(
  graphql(gql`
    query PostsQuery {
      allPosts(first: 10) {
        id
        title
        url
      }
    }
  `)
)(Posts);