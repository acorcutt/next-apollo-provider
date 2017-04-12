import { compose } from 'react-apollo';

import Root from '../layouts/Root';
import Posts from '../components/Posts';
import Menu from '../components/Menu';

import withApollo from '../lib/withApolloSimple';

const Page = ({ initialState })=>(<Root className="mw7 center ph2">
  <h1 className="f1">With Simple Settings</h1>
  <Menu />
  <Posts />
</Root>);

export default compose(
  withApollo
)(Page);