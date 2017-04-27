# next-apollo-provider

A helper to make an [ApolloProvider](http://dev.apollodata.com/react/index.html) available as a high order component for [next.js](https://github.com/zeit/next.js) pages.

## Install

```
npm install next-apollo-provider --save
```

## Setup

By default the provider will create and cache an ApolloClient for each unique URI provided to a NetworkInterface, so its best to create your own `withApollo.js` wrapper with your settings and not apply `nextApolloProvider` to components directly.

### Create a basic Wrapper

Provide a URL that points to a GraphQL server and a default configuration and network interface will be automatically created.

```
import nextApolloProvider from 'next-apollo-provider';

export default nextApolloProvider(process.env.GRAPHQL_URL);
```

Ensure you make the environment variable available to the client - see [with-universal-configuration](https://github.com/zeit/next.js/tree/master/examples/with-universal-configuration) for an example.

### Create from an ApolloClient settings object

Provide an ApolloClient settings object to customise the connection. You should not set `initialState` and `ssrMode` they will be automatically attached. All other options are supported including networkInterfaces and middleware. 
By default an ApolloClient will be created and reused across requests for each unique `networkInterface.uri` provided, you can supply an additional `name` property if you need multiple clients and settings per endpoint.

```
import nextApolloProvider from 'next-apollo-provider';
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
```

### Create from a function that returns settings

You can provide a function that returns a settings object for more control. You will need to set the provided `initialState` and `ssrMode` yourself. The request context will be available on the initial server request to access headers etc.

```
import nextApolloProvider from 'next-apollo-provider';
import { createNetworkInterface } from 'react-apollo';

export default nextApolloProvider((initialState, ssrMode, context)=>{

  let networkInterface = createNetworkInterface({
    uri: process.env.GRAPHQL_URL,
    opts: {
      credentials: 'same-origin'
    }
  });
    
  networkInterface.use([{
    applyMiddleware(req, next) {
      // Do some middleware such as authentication headers.
      next();
    }
  }]);
  
  return {
    initialState,
    ssrMode,
    connectToDevTools: (process.browser && process.env.NODE_ENV !== 'production'),
    dataIdFromObject: (result) => (result.id || null),
    networkInterface
  });
```

### Use a function that returns an ApolloClient

If you need more control your settings function can return a `getApolloClient(initialState, ssrMode, context)` function which should return your own ApolloClient instance.

```
import nextApolloProvider from 'next-apollo-provider';
import { ApolloClient, createNetworkInterface } from 'react-apollo';

let apolloClient = null;

function getApolloClient(initialState, ssrMode){
  let settings = {
    initialState,
    ssrMode,
    connectToDevTools: (process.browser && process.env.NODE_ENV !== 'production'),
    dataIdFromObject: (result) => (result.id || null),
    networkInterface: createNetworkInterface({
      uri: process.env.GRAPHQL_URL,
      opts: {
        credentials: 'same-origin'
      }
    })
  };

  if (!process.browser) {
    return new ApolloClient(settings);   
  } else if(apolloClient) {
    return apolloClient;
  } else {
    apolloClient = new ApolloClient(settings); 
    return apolloClient;
  }   
}

export default nextApolloProvider(()=>(getApolloClient));
```

### Redux Integration

Provide a `getReduxStore(client, initialState)` function as the second parameter and return a reduxStore to use a custom Redux store.

```
import nextApolloProvider from 'next-apollo-provider';
import { createNetworkInterface } from 'react-apollo';

const apolloClientSettings = {
  networkInterface: createNetworkInterface({
    uri: process.env.GRAPHQL_URL,
  })
};

let reduxStore = null;

function getReduxStore(client, initialState){
  ... TODO
  return reduxStore;
}
export default nextApolloProvider(apolloClientSettings, getReduxStore);
```


### Usage

Use the `withApollo` HOC you created to wrap a next.js page, compose with `graphql` as required. The server needs to evaluate `getInitialProps` twice to fetch the `initialSate`, so use the provided `initialState` property to detect when the server has data to prevent the rendering of multiple `<Head>` tags for example.

```
import { gql, graphql, compose } from 'react-apollo';
import withApollo from './withApollo';

const Posts = ({ initialState, apolloClient })=>{
  return <div>{ initialState ? 'We have data!' : 'Server is loading data!'}</div>;
}

export default compose(
  withApollo, 
  graphql(gql`
    query PostsQuery {
      post {
        id
      }
    }
  `)
)(Posts);
```

## Build & Run Examples

The examples in `/pages` use an API at [graph.cool](https://api.graph.cool/simple/v1/cixmkt2ul01q00122mksg82pn)

Set an environment variable for `GRAPHQL_URL=https://api.graph.cool/simple/v1/cixmkt2ul01q00122mksg82pn`

The module uses a simple next boilerplate and exports `next-apollo-provider` from `/lib/next-apollo-provider`, run with `npm start dev`, build with `next build`.

## TODO

- Some tests
- Custom client example
- Redux example
