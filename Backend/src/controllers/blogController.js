import {
  createBlogService,
  getBlogsService,
  getBlogByIdService,
  updateBlogService,
  deleteBlogService,
  restoreBlogService,
} from '../services/blogService.js';

export async function createBlog(req, res, next) {
  try {
    const { title, description, contentHtml } = req.body;
    // No auth: default authorId to 0 or use provided authorId if passed in body
    const authorId = Number(req.body.authorId) || 0;

    if (!title || !contentHtml) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    // Debug logs to diagnose image issue
    console.log('createBlog -> req.file:', req.file);
    console.log('createBlog -> req.body.imageUrl:', req.body?.imageUrl);
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : (req.body.imageUrl || null);
    console.log('createBlog -> final imageUrl:', imageUrl);

    const created = await createBlogService({ title, description, contentHtml, imageUrl, createdBy: req.body?.createdBy, authorId });
    return res.status(201).json({ success: true, message: 'Blog created', data: created });
  } catch (err) {
    next(err);
  }
}

export async function getBlogs(req, res, next) {
  try {
    const { status } = req.query; // optional: 'all' | 'active' | 'inactive'
    const blogs = await getBlogsService(status || 'all');
    // Apply a final filter layer to ensure correctness regardless of SP behavior
    const normalized = Array.isArray(blogs) ? blogs : [];
    const wanted = (status || 'all').toLowerCase();
    const filtered = wanted === 'all' ? normalized : normalized.filter((b) => {
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
      return wanted === 'active' ? isActive : !isActive;
    });
    try { console.log(`[getBlogs] status=${status || 'all'} rows_in=${normalized.length} rows_out=${filtered.length}`); } catch {}
    return res.json({ success: true, message: 'Blogs fetched', data: filtered });
  } catch (err) {
    next(err);
  }
}

export async function getBlogById(req, res, next) {
  try {
    const { id } = req.params;
    const blog = await getBlogByIdService(Number(id));
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    return res.json({ success: true, message: 'Blog fetched', data: blog });
  } catch (err) {
    next(err);
  }
}

export async function updateBlog(req, res, next) {
  try {
    const { id } = req.params;
    const { title, description, contentHtml } = req.body;
    // No auth: default authorId to 0 or use provided authorId if passed in body
    const authorId = Number(req.body.authorId) || 0;

    // Debug logs to diagnose image issue
    console.log('updateBlog -> req.file:', req.file);
    console.log('updateBlog -> req.body.imageUrl:', req.body?.imageUrl);
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl || null;
    console.log('updateBlog -> final imageUrl:', imageUrl);

    const updated = await updateBlogService(Number(id), { title, description, contentHtml, imageUrl, authorId });
    return res.json({ success: true, message: 'Blog updated', data: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteBlog(req, res, next) {
  try {
    const { id } = req.params;
    const modifiedBy = req.body?.modifiedBy || req.query?.modifiedBy; // optional

    await deleteBlogService(Number(id), modifiedBy);
    return res.json({ success: true, message: 'Blog deleted' });
  } catch (err) {
    next(err);
  }
}

export async function restoreBlog(req, res, next) {
  try {
    const { id } = req.params;
    const modifiedBy = req.body?.modifiedBy || req.query?.modifiedBy; // optional

    await restoreBlogService(Number(id), modifiedBy);
    return res.json({ success: true, message: 'Blog restored' });
  } catch (err) {
    next(err);
  }
}
