import BlogCard from './BlogCard';

export default function BlogList({ blogs, onToggleStatus }) {
  if (!blogs || blogs.length === 0) {
    return <div className="alert alert-info">No blogs found.</div>;
  }
  return (
    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
      {blogs.map((b) => (
        <BlogCard key={b.BlogId || b.Id} blog={b} onToggleStatus={onToggleStatus} />
      ))}
    </div>
  );
}
