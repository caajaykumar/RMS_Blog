const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:5000';

async function handle(res) {
  if (!res.ok) {
    let msg = 'Request failed';
    try {
      const j = await res.json();
      msg = j.message || JSON.stringify(j);
    } catch {}
    throw new Error(msg);
  }
  const data = await res.json();
  return data.data || data;
}

export async function getBlogs(options = {}) {
  // options: { status?: 'all'|'active'|'inactive', includeDeleted?: boolean, includeInactive?: boolean }
  const url = new URL(`${BASE_URL}/api/blogs`);
  if (options.status) url.searchParams.set('status', options.status);
  if (options.includeDeleted) url.searchParams.set('includeDeleted', 'true');
  if (options.includeInactive) url.searchParams.set('includeInactive', 'true');
  const res = await fetch(url.toString(), { cache: 'no-store' });
  return handle(res);
}

export async function getBlogById(id) {
  const res = await fetch(`${BASE_URL}/api/blogs/${id}`, { cache: 'no-store' });
  return handle(res);
}

export async function createBlog({ title, description, contentHtml, imageUrl, createdBy }) {
  // Use JSON path (no file upload in this form)
  const res = await fetch(`${BASE_URL}/api/blogs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, contentHtml, imageUrl, createdBy })
  });
  return handle(res);
}

export async function deleteBlog(id, modifiedBy = 'frontend_user') {
  const url = new URL(`${BASE_URL}/api/blogs/${id}`);
  url.searchParams.set('modifiedBy', modifiedBy);
  const res = await fetch(url.toString(), { method: 'DELETE' });
  return handle(res);
}

export async function restoreBlog(id, modifiedBy = 'frontend_user') {
  const url = new URL(`${BASE_URL}/api/blogs/${id}/restore`);
  url.searchParams.set('modifiedBy', modifiedBy);
  const res = await fetch(url.toString(), { method: 'PATCH' });
  return handle(res);
}

