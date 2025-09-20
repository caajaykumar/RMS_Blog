import Link from 'next/link';

export default function BlogCard({ blog, onToggleStatus }) {
  const createdAt = blog.Created || blog.CreatedAt || blog.createdAt;
  const imgSrc = blog.ImageUrl || blog.imageUrl || 'https://via.placeholder.com/800x450?text=No+Image';
  const short = blog.ShortDescription || blog.Description || '';
  const title = blog.Title || blog.title || '';
  const id = blog.BlogId || blog.Id;

  const formattedDate = createdAt ? new Date(createdAt).toLocaleDateString(undefined, {
    day: '2-digit', month: 'short', year: 'numeric'
  }) : '';

  return (
    <div className="col">
      <div className="card h-100 shadow-sm position-relative overflow-hidden">
        <div className="position-relative">
          <img src={imgSrc} className="card-img-top" alt={title} style={{objectFit:'cover', height: 220}} />
          {formattedDate && (
            <div className="date-badge">
              <span className="me-2">📅</span>
              {formattedDate}
            </div>
          )}
        </div>
        <div className="card-body d-flex flex-column">
          <h5 className="card-title fw-bold text-success-emphasis">{title}</h5>
          <p className="card-text text-muted" style={{minHeight: 96}}>{short}</p>
        </div>
        <div className="card-footer bg-white border-0">
          <div className="d-flex justify-content-start align-items-center">
            <Link href={`/blog/${id}`} className="btn btn-readmore" aria-label="Read more">
              <span className="fs-8">»Read More</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
