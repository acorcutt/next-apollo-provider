import nextApolloProvider from '../next-apollo-provider';
import { createNetworkInterface } from 'react-apollo';

export default nextApolloProvider({
  connectToDevTools: (process.browser && process.env.NODE_ENV !== 'production'),
  dataIdFromObject: (result) => (result.id || null),
  networkInterface: createNetworkInterface({
    uri: process.env.GRAPHQL_URL,
    opts: {
      credentials: 'same-origin'
    }
  })
});


