import 'isomorphic-fetch';
import React from 'react';
import { ApolloClient, ApolloProvider, getDataFromTree, createNetworkInterface } from 'react-apollo';

// Client instances that we manage
let apolloClients = {};

function getApolloClient(apolloClientSettings, initialState, ssrMode, context){

  let settings = null;
  
  if(typeof apolloClientSettings === 'function'){
    settings = apolloClientSettings(initialState, ssrMode, context);
  } else if (typeof apolloClientSettings === 'string'){
    settings = {
      connectToDevTools: false,
      dataIdFromObject: (result) => (result.id || null),
      networkInterface: createNetworkInterface({
        uri: apolloClientSettings,
        opts: {
          credentials: 'same-origin'
        }
      })
    };
  } else {
    settings = {...apolloClientSettings, initialState, ssrMode };
  }

  // If apolloClientSettings returns a function then assume you are going to return an ApolloClient  
  if(settings instanceof Function){
    return settings(initialState, ssrMode, context);
  } else {
    
    // Try and create a unique key for this client 
    let key = 'CLIENT_' + (settings.name || (settings.networkInterface && settings.networkInterface._uri) || 'default');
    
    if (!process.browser) {
      // THE SERVER SHOULD NOT SHARE AN INSTANCE ACROSS REQUESTS!
      return new ApolloClient(settings);   
    } else if(apolloClients[key]) {
      // Client can reuse an instance if its available
      return apolloClients[key];
    } else {
      // Create new client instance
      apolloClients[key] = new ApolloClient(settings); 
      return apolloClients[key];
    }      
  }
}

export default (apolloClientSettings, getReduxStore) => {

  return (Component) => (
    class extends React.Component {
      static async getInitialProps (context) {
        
        // Get client or build client and custom store if provided.
        const client = getApolloClient(apolloClientSettings, undefined, !process.browser, context);
        const store = getReduxStore && getReduxStore(client, client.initialState);
        
        const props = {
          url: { query: context.query, pathname: context.pathname }, // Server render needs to see url and params
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