import nextApolloProvider from '../next-apollo-provider';

export default nextApolloProvider(process.env.GRAPHQL_URL);