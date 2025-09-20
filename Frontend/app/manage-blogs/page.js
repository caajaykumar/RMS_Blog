'use client';

import { useEffect, useMemo, useState } from 'react';
import { getBlogs, deleteBlog, restoreBlog } from '../../lib/api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function ManageBlogsPage() {
  // Blogs for the current tab
  const [blogs, setBlogs] = useState([]);
  // All blogs for counts across tabs
  const [allBlogs, setAllBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | active | inactive

  // Toast notifications
  const [toasts, setToasts] = useState([]);
  const addToast = (variant, message) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, variant, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  };

  // Confirm modal state
  const [confirmState, setConfirmState] = useState({ show: false, title: '', message: '', onConfirm: null });
  const openConfirm = (title, message, onConfirm) => setConfirmState({ show: true, title, message, onConfirm });
  const closeConfirm = () => setConfirmState({ show: false, title: '', message: '', onConfirm: null });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        // Always fetch all for counts
        const [allData, tabData] = await Promise.all([
          getBlogs({ status: 'all', includeDeleted: true, includeInactive: true }),
          getBlogs({ status: filter, includeDeleted: true, includeInactive: true }),
        ]);
        setAllBlogs(allData || []);
        setBlogs(tabData || []);
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

  const { allCount, activeCount, inactiveCount } = useMemo(() => {
    const counts = { allCount: allBlogs.length, activeCount: 0, inactiveCount: 0 };
    for (const b of allBlogs) {
      const hasIsActive = Object.prototype.hasOwnProperty.call(b, 'IsActive');
      const hasIsDeleted = Object.prototype.hasOwnProperty.call(b, 'IsDeleted');
      const hasInActive = Object.prototype.hasOwnProperty.call(b, 'InActive') || Object.prototype.hasOwnProperty.call(b, 'Inactive');
      const inActiveFlag = b.InActive ?? b.Inactive; // could be 0/1 or boolean
      const isActive = hasIsActive
        ? Boolean(b.IsActive)
        : hasIsDeleted
          ? !Boolean(b.IsDeleted)
          : hasInActive
            ? !Boolean(inActiveFlag)
            : true;
      if (isActive) counts.activeCount += 1; else counts.inactiveCount += 1;
    }
    return counts;
  }, [allBlogs]);

  const refresh = async () => {
    try {
      const [allData, tabData] = await Promise.all([
        getBlogs({ status: 'all', includeDeleted: true, includeInactive: true }),
        getBlogs({ status: filter, includeDeleted: true, includeInactive: true }),
      ]);
      setAllBlogs(allData || []);
      setBlogs(tabData || []);
    } catch (err) {
      setError(err.message || 'Failed to refresh');
    }
  };

  const onToggle = (blog) => {
    const id = blog.BlogId || blog.Id;
    const isActive = blog.IsActive !== undefined ? blog.IsActive : (blog.IsDeleted !== undefined ? !blog.IsDeleted : true);
    const action = isActive ? 'Deactivate' : 'Activate';
    const nextTab = isActive ? 'inactive' : 'active';
    openConfirm(
      `${action} Blog`,
      `Are you sure you want to ${action.toLowerCase()} this blog?`,
      async () => {
        try {
          if (isActive) {
            await deleteBlog(id, 'frontend_user');
          } else {
            await restoreBlog(id, 'frontend_user');
          }
          setFilter(nextTab);
          await refresh();
          addToast('success', `Blog ${action.toLowerCase()}d successfully`);
        } catch (err) {
          addToast('danger', err.message || `Failed to ${action.toLowerCase()} blog`);
        } finally {
          closeConfirm();
        }
      }
    );
  };

  if (loading) return <LoadingSpinner label="Loading blogs..." />;
  if (error) return <div className="alert alert-danger" role="alert">{error}</div>;

  return (
    <div className="container-fluid">
      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        <h4 className="m-0">Manage Blogs</h4>
        <div className="btn-group ms-3" role="group">
          <button className={`btn btn-outline-primary ${filter==='all'?'active':''}`} onClick={() => setFilter('all')}>
            All <span className="badge text-bg-secondary ms-1">{allCount}</span>
          </button>
          {/* <button className={`btn btn-outline-primary ${filter==='active'?'active':''}`} onClick={() => setFilter('active')}>
            Active <span className="badge text-bg-secondary ms-1">{activeCount}</span>
          </button> */}
          {/* <button className={`btn btn-outline-primary ${filter==='inactive'?'active':''}`} onClick={() => setFilter('inactive')}>
            Inactive <span className="badge text-bg-secondary ms-1">{inactiveCount}</span>
          </button> */}
        </div>
        <div className="ms-auto" style={{minWidth: 260}}>
          <input className="form-control" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th style={{width: 60}}>#</th>
              <th>Title</th>
              <th>Description</th>
              <th style={{width: 160}}>Status</th>
              <th style={{width: 160}}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b, idx) => {
              const id = b.BlogId || b.Id;
              const title = b.Title || b.title || '';
              const short = b.ShortDescription || b.Description || '';
              const hasIsActive = Object.prototype.hasOwnProperty.call(b, 'IsActive');
              const hasIsDeleted = Object.prototype.hasOwnProperty.call(b, 'IsDeleted');
              const hasInActive = Object.prototype.hasOwnProperty.call(b, 'InActive') || Object.prototype.hasOwnProperty.call(b, 'Inactive');
              const inActiveFlag = b.InActive ?? b.Inactive;
              const isActive = hasIsActive
                ? Boolean(b.IsActive)
                : hasIsDeleted
                  ? !Boolean(b.IsDeleted)
                  : hasInActive
                    ? !Boolean(inActiveFlag)
                    : true;
              return (
                <tr key={id}>
                  <td>{idx + 1}</td>
                  <td>{title}</td>
                  <td className="text-muted" style={{maxWidth: 480}}>
                    <div className="text-truncate" style={{maxWidth: 480}} title={short}>{short}</div>
                  </td>
                  <td>
                    {isActive ? (
                      <span className="badge bg-success">Active</span>
                    ) : (
                      <span className="badge bg-secondary">Inactive</span>
                    )}
                  </td>
                  <td>
                    {isActive ? (
                      <button className="btn btn-outline-danger btn-sm" onClick={() => onToggle(b)}>Deactivate</button>
                    ) : (
                      <button className="btn btn-outline-success btn-sm" onClick={() => onToggle(b)}>Activate</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Confirm Modal */}
      {confirmState.show && (
        <>
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" role="dialog" aria-modal="true">
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{confirmState.title}</h5>
                  <button type="button" className="btn-close" aria-label="Close" onClick={closeConfirm}></button>
                </div>
                <div className="modal-body">
                  <p className="mb-0">{confirmState.message}</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeConfirm}>Cancel</button>
                  <button type="button" className="btn btn-primary" onClick={confirmState.onConfirm}>Confirm</button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {/* Toasts Container */}
      <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1080 }}>
        <div className="toast-container">
          {toasts.map((t) => (
            <div key={t.id} className={`toast align-items-center text-bg-${t.variant} show mb-2`} role="alert">
              <div className="d-flex">
                <div className="toast-body">{t.message}</div>
                <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
