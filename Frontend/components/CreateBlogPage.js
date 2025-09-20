'use client';
import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import 'quill/dist/quill.snow.css';
import { createBlog } from '../lib/api';

// Load ReactQuill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function CreateBlogPage() {
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [createdBy, setCreatedBy] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState('edit'); // edit | preview
  const [alert, setAlert] = useState({ type: '', message: '' });

  const titleMax = 200;
  const shortMax = 500;

  const modules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'blockquote', 'code-block'],
      ['clean'],
    ],
    clipboard: { matchVisual: false },
    keyboard: { bindings: {} },
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link', 'blockquote', 'code-block'
  ];

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = 'Title is required';
    if (title.length > titleMax) e.title = `Max ${titleMax} characters`;
    if (shortDescription.length > shortMax) e.shortDescription = `Max ${shortMax} characters`;

    const plain = contentHtml.replace(/<[^>]*>/g, '').trim();
    if (!plain) e.contentHtml = 'Content is required';

    if (imageUrl) {
      const urlOk = /^https?:\/\//i.test(imageUrl);
      if (!urlOk) e.imageUrl = 'Must be a valid URL starting with http/https';
    }

    if (!createdBy.trim()) e.createdBy = 'CreatedBy is required';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setAlert({ type: '', message: '' });
    try {
      await createBlog({
        title,
        description: shortDescription,
        contentHtml,
        imageUrl: imageUrl || null,
        createdBy: createdBy || 'frontend_user',
      });
      setAlert({ type: 'success', message: 'Blog created successfully!' });
      setTimeout(() => {
        if (typeof window !== 'undefined') window.location.href = '/';
      }, 1000);
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Failed to create blog' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <h1 className="h3 mb-4">Create Blog</h1>

      {alert.message && (
        <div className={`alert alert-${alert.type}`} role="alert">{alert.message}</div>
      )}

      <form onSubmit={onSubmit} noValidate>
        <div className="row g-3">
          <div className="col-12">
            <label className="form-label">Title</label>
            <input
              className={`form-control ${errors.title ? 'is-invalid' : title ? 'is-valid' : ''}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={titleMax}
            />
            <div className="d-flex justify-content-between small mt-1">
              <span className="text-muted">Max {titleMax} chars</span>
              <span className="text-muted">{title.length}/{titleMax}</span>
            </div>
            {errors.title && <div className="invalid-feedback">{errors.title}</div>}
          </div>

          <div className="col-12">
            <label className="form-label">Short Description</label>
            <textarea
              className={`form-control ${errors.shortDescription ? 'is-invalid' : shortDescription ? 'is-valid' : ''}`}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              maxLength={shortMax}
              rows={3}
            />
            <div className="d-flex justify-content-between small mt-1">
              <span className="text-muted">Max {shortMax} chars</span>
              <span className="text-muted">{shortDescription.length}/{shortMax}</span>
            </div>
            {errors.shortDescription && <div className="invalid-feedback">{errors.shortDescription}</div>}
          </div>

          <div className="col-12">
            <div className="d-flex align-items-center gap-2 mb-2">
              <label className="form-label m-0">Content</label>
              <div className="ms-auto btn-group">
                <button type="button" className={`btn btn-sm btn-outline-secondary ${mode==='edit'?'active':''}`} onClick={() => setMode('edit')}>Editor</button>
                <button type="button" className={`btn btn-sm btn-outline-secondary ${mode==='preview'?'active':''}`} onClick={() => setMode('preview')}>Preview</button>
              </div>
            </div>
            {mode === 'edit' ? (
              <div className={`quill-wrapper ${errors.contentHtml ? 'is-invalid-border' : ''}`}>
                <ReactQuill
                  theme="snow"
                  value={contentHtml}
                  onChange={setContentHtml}
                  modules={modules}
                  formats={formats}
                  style={{ minHeight: 300 }}
                />
              </div>
            ) : (
              <div className="card">
                <div className="card-body">
                  <div className="content" dangerouslySetInnerHTML={{ __html: contentHtml || '<p class="text-muted">Nothing to preview</p>' }} />
                </div>
              </div>
            )}
            {errors.contentHtml && <div className="text-danger small mt-1">{errors.contentHtml}</div>}
          </div>

          <div className="col-md-6">
            <label className="form-label">Image URL</label>
            <input
              className={`form-control ${errors.imageUrl ? 'is-invalid' : imageUrl ? 'is-valid' : ''}`}
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            {errors.imageUrl && <div className="invalid-feedback">{errors.imageUrl}</div>}
            {imageUrl && /^https?:\/\//i.test(imageUrl) && (
              <img src={imageUrl} alt="preview" className="img-thumbnail mt-2" style={{ maxWidth: 260 }} />
            )}
          </div>

          <div className="col-md-6">
            <label className="form-label">Created By</label>
            <input
              className={`form-control ${errors.createdBy ? 'is-invalid' : createdBy ? 'is-valid' : ''}`}
              value={createdBy}
              onChange={(e) => setCreatedBy(e.target.value)}
            />
            {errors.createdBy && <div className="invalid-feedback">{errors.createdBy}</div>}
          </div>

          <div className="col-12">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting && <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>}
              Submit
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
