import Link from 'next/link';

const linkClass = "link white dib bg-blue hover-bg-blue bg-animate br2 mr2 pv1 ph2";

export default () => (<div className="pv3">
  <Link href="/" prefetch><a className={linkClass}>Home</a></Link>
  <Link href="/basic" prefetch><a className={linkClass}>Basic Example</a></Link>
  <Link href="/simple" prefetch><a className={linkClass}>Simple Settings Example</a></Link>
  <Link href="/function" prefetch><a className={linkClass}>Function Settings Example</a></Link>
</div>);
