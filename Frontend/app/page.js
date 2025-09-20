'use client';
import { useEffect, useMemo, useState } from 'react';
import BlogList from '../components/BlogList';
import LoadingSpinner from '../components/LoadingSpinner';
import { getBlogs, deleteBlog, restoreBlog } from '../lib/api';

export default function HomePage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all | active | inactive
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const status = filter; // 'all' | 'active' | 'inactive'
        const data = await getBlogs({ status, includeDeleted: true, includeInactive: true });
        setBlogs(data);
      } catch (err) {
        setError(err.message || 'Failed to load blogs');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filter]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return blogs.filter((b) => {
      if (!q) return true;
      const title = String(b.Title || b.title || '').toLowerCase();
      const short = String(b.ShortDescription || b.Description || '').toLowerCase();
      return title.includes(q) || short.includes(q);
    });
  }, [blogs, filter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const onToggleStatus = async (blog) => {
    try {
      const isActive = blog.IsActive !== undefined ? blog.IsActive : (blog.IsDeleted !== undefined ? !blog.IsDeleted : true);
      if (isActive) {
        await deleteBlog(blog.BlogId || blog.Id, 'frontend_user');
      } else {
        await restoreBlog(blog.BlogId || blog.Id, 'frontend_user');
      }
      const status = filter;
      const data = await getBlogs({ status, includeDeleted: true, includeInactive: true });
      setBlogs(data);
    } catch (err) {
      alert('Failed to toggle status: ' + (err.message || 'unknown error'));
    }
  };

  if (loading) return <LoadingSpinner label="Loading blogs..." />;
  if (error) return <div className="alert alert-danger" role="alert">{error}</div>;

  return (
    <div className="container-fluid">
      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        {/* <div className="btn-group" role="group">
          <button className={`btn btn-outline-primary ${filter==='all'?'active':''}`} onClick={() => {setFilter('all'); setPage(1);}}>All</button> 
          <button className={`btn btn-outline-primary ${filter==='active'?'active':''}`} onClick={() => {setFilter('active'); setPage(1);}}>Active</button> 
          <button className={`btn btn-outline-primary ${filter==='inactive'?'active':''}`} onClick={() => {setFilter('inactive'); setPage(1);}}>Inactive</button>
        </div> */}
        <div className="ms-auto" style={{minWidth: 260}}>
          <input className="form-control" placeholder="Search..." value={search} onChange={(e) => {setSearch(e.target.value); setPage(1);}} />
        </div>
      </div>

      <BlogList blogs={paged} onToggleStatus={onToggleStatus} />

      <nav aria-label="Page navigation" className="d-flex justify-content-center mt-3">
        <ul className="pagination">
          <li className={`page-item ${page===1?'disabled':''}`}>
            <button className="page-link" onClick={() => setPage((p) => Math.max(1, p-1))}>Previous</button>
          </li>
          {Array.from({ length: totalPages }).map((_, idx) => (
            <li key={idx} className={`page-item ${page===idx+1?'active':''}`}>
              <button className="page-link" onClick={() => setPage(idx+1)}>{idx+1}</button>
            </li>
          ))}
          <li className={`page-item ${page===totalPages?'disabled':''}`}>
            <button className="page-link" onClick={() => setPage((p) => Math.min(totalPages, p+1))}>Next</button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
