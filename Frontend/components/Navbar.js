import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom">
      <div className="container-fluid">
        <Link className="navbar-brand" href="/">
           <Image src="https://www.radhamadhavsociety.org/assets/images/about/i-logo-2.png" alt="Logo" width={300} height={50} />
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" href="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href="/create-blog">Create Blog</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href="/manage-blogs">Manage Blogs</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

