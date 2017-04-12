import { compose } from 'react-apollo';

import Root from '../layouts/Root';
import Posts from '../components/Posts';
import Menu from '../components/Menu';

import withApollo from '../lib/withApolloFunction';

const Page = ({ initialState })=>(<Root className="mw7 center ph2">
  <h1 className="f1">With Function</h1>
  <Menu />
  <Posts />
</Root>);

export default compose(
  withApollo
)(Page);