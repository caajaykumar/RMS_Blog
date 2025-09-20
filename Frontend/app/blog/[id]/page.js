'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getBlogById } from '../../../lib/api';
import LoadingSpinner from '../../../components/LoadingSpinner';

export default function BlogDetailsPage() {
  const params = useParams();
  const id = params?.id;
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getBlogById(id);
        setBlog(data);
      } catch (err) {
        setError(err.message || 'Failed to load blog');
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  if (loading) return <LoadingSpinner label="Loading blog..." />;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!blog) return <div className="alert alert-warning">Blog not found</div>;

  const title = blog.Title || blog.title || '';
  const imgSrc = blog.ImageUrl || blog.imageUrl || 'https://via.placeholder.com/1200x500?text=No+Image';
  const createdAt = blog.Created || blog.CreatedAt || blog.createdAt;
  const content = blog.Content || blog.ContentHtml || blog.contentHtml || '';

  return (
    <div className="container">
      <div className="card shadow-sm">
        <img src={imgSrc} className="card-img-top" alt={title} style={{objectFit:'cover', height: 360}} />
        <div className="card-body">
          <h1 className="h3 fw-bold mb-3">{title}</h1>
          <div className="text-muted mb-3">{createdAt ? new Date(createdAt).toLocaleString() : ''}</div>
          <div className="content" dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </div>
    </div>
  );
}
