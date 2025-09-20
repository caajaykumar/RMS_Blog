import { getPool, sql } from '../config/db.js';

export async function createBlogService({ title, description, contentHtml, imageUrl, createdBy }) {
  const pool = await getPool();
  const request = pool.request();
  request.input('Title', sql.NVarChar(sql.MAX), title);
  // Match SP param name
  request.input('ShortDescription', sql.NVarChar(sql.MAX), description);
  // SP expects @Content instead of ContentHtml
  request.input('Content', sql.NVarChar(sql.MAX), contentHtml);
  request.input('ImageUrl', sql.NVarChar(500), imageUrl);
  // SP expects @CreatedBy VARCHAR(30)
  request.input('CreatedBy', sql.VarChar(30), createdBy || 'system');
  const result = await request.execute('dbo.USP_CreateRMSBlog');
  // Assuming procedure returns created rowset
  const row = result.recordset && result.recordset[0];
  return row || null;
}

export async function getBlogsService(status = 'all') {
  const pool = await getPool();
  const request = pool.request();
  let proc = 'dbo.USP_GetBlogs';
  if (String(status).toLowerCase() === 'inactive') {
    proc = 'dbo.USP_GetInactiveRMSBlogs';
  }
  const result = await request.execute(proc);
  // Some stored procedures return multiple recordsets (e.g., summary + rows)
  // Choose the recordset with the maximum number of rows to avoid selecting summary rows.
  let rows = Array.isArray(result.recordset) ? result.recordset : [];
  if (Array.isArray(result.recordsets) && result.recordsets.length > 0) {
    let maxLen = -1;
    let chosen = rows;
    result.recordsets.forEach((rs, idx) => {
      const len = Array.isArray(rs) ? rs.length : 0;
      if (len > maxLen) {
        maxLen = len;
        chosen = rs;
      }
    });
    rows = chosen || rows;
  }
  try {
    const lens = Array.isArray(result.recordsets) ? result.recordsets.map((rs) => (Array.isArray(rs) ? rs.length : 0)) : [];
    const keys = Array.isArray(rows) && rows[0] ? Object.keys(rows[0]) : [];
    console.log(`[getBlogsService] proc=${proc} recordsets=${JSON.stringify(lens)} chosen=${Array.isArray(rows) ? rows.length : 0} keys=${keys.join(',')}`);
  } catch {}
  return rows || [];
}

export async function getBlogByIdService(blogId) {
  const pool = await getPool();
  const result = await pool.request().input('BlogId', sql.Int, blogId).execute('dbo.USP_GetBlogById');
  return result.recordset && result.recordset[0];
}

export async function updateBlogService(blogId, { title, description, contentHtml, imageUrl, authorId }) {
  const pool = await getPool();
  const request = pool.request();
  request.input('BlogId', sql.Int, blogId);
  request.input('Title', sql.NVarChar(sql.MAX), title);
  // Match SP param name
  request.input('ShortDescription', sql.NVarChar(sql.MAX), description);
  request.input('ContentHtml', sql.NVarChar(sql.MAX), contentHtml);
  request.input('ImageUrl', sql.NVarChar(500), imageUrl || null);
  request.input('AuthorId', sql.Int, authorId);
  const result = await request.execute('dbo.USP_UpdateBlog');
  const row = result.recordset && result.recordset[0];
  return row || null;
}

export async function deleteBlogService(blogId, modifiedBy) {
  const pool = await getPool();
  const request = pool.request();
  request.input('BlogId', sql.Int, blogId);
  // Align with SP that expects @ModifiedBy
  request.input('ModifiedBy', sql.VarChar(30), modifiedBy || 'system');
  await request.execute('dbo.USP_DeleteBlog');
  return true;
}

export async function restoreBlogService(blogId, modifiedBy) {
  const pool = await getPool();
  const request = pool.request();
  request.input('BlogId', sql.Int, blogId);
  // Align with SP that may expect @ModifiedBy
  request.input('ModifiedBy', sql.VarChar(30), modifiedBy || 'system');
  await request.execute('dbo.USP_RestoreBlog');
  return true;
}
