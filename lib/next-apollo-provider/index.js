import 'isomorphic-fetch';
import React from 'react';
import { ApolloClient, ApolloProvider, getDataFromTree, createNetworkInterface } from 'react-apollo';

// Use a single instance on a client
let apolloClient = null;

function getApolloClient(apolloClientSettings, initialState, ssrMode, context){

  let settings = null;
  
  if(apolloClientSettings instanceof Function){
    settings = apolloClientSettings(initialState, ssrMode, context);
  } else {
    settings = {...apolloClientSettings, initialState, ssrMode };
  }

  // If apolloClientSettings returns a function then assume you are going to return an ApolloClient  
  if(settings instanceof Function){
    return settings(initialState, ssrMode, context);
  } else {
    
    if (!process.browser) {
      // THE SERVER SHOULD NOT SHARE AN INSTANCE ACROSS REQUESTS!
      return new ApolloClient(settings);   
    } else if(apolloClient) {
      // Client can reuse an instance if its available
      return apolloClient;
    } else {
      // Create client instance
      apolloClient = new ApolloClient(settings); 
      return apolloClient;
    }      
  }
}

export default (apolloClientSettings = {
    connectToDevTools: (process.browser && process.env.NODE_ENV !== 'production'),
    dataIdFromObject: (result) => (result.id || null),
    networkInterface: createNetworkInterface({
      uri: process.env.GRAPHQL_URL,
      opts: {
        credentials: 'same-origin'
      }
    })
  }, getReduxStore) => {

  return (Component) => (
    class extends React.Component {
      static async getInitialProps (context) {
        
        // Get client or build client and custom store if provided.
        const client = getApolloClient(apolloClientSettings, undefined, !process.browser, context);
        const store = getReduxStore && getReduxStore(client, client.initialState);
        
        const props = {
          ...await (Component.getInitialProps ? Component.getInitialProps(context) : {})
        };
  
        if (!process.browser) {
          const app = (<ApolloProvider client={client} store={store}><Component {...props} /></ApolloProvider>);
          await getDataFromTree(app);
        }
        
        const storeState = store && store.getState();
        
        return {
          initialState: {
            ...storeState,
            apollo: {
              data: client.getInitialState().data
            }
          },
          ...props
        };
      }
  
      constructor (props) {
        super(props);
        // We dont send context on the second server render as it should use initialState and not make a network request.
        this.client = getApolloClient(apolloClientSettings, this.props.initialState, !process.browser);
        this.store = getReduxStore && getReduxStore(this.client, this.props.initialState);
      }
  
      render () {
        return (<ApolloProvider client={this.client} store={this.store}><Component {...this.props} /></ApolloProvider>);
      }
    }
  );
};