import Link from 'next/link';
import { blogPosts } from '@/data/blog-posts';

export default function BlogGrid() {
  if (blogPosts.length === 0) return null;

  return (
    <section id="blog" className="py-16">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        {/* 섹션 타이틀 */}
        <div className="mb-10 text-center">
          <p className="section-label mb-2">블로그</p>
          <h2 className="text-2xl font-bold md:text-3xl">
            변기막힘 싱크대막힘 하수구막힘 해결 후기
          </h2>
        </div>

        <div className="blog-grid">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/${post.city}/${post.slug}`}
              className="card-shadow overflow-hidden"
            >
              {/* 썸네일 */}
              <img
                src={post.thumbnail}
                alt={post.title}
                className="aspect-[3/2] w-full object-contain bg-gray-50"
                loading="lazy"
                width={1200}
                height={800}
              />

              {/* 제목 */}
              <div className="p-3 text-center">
                <p className="line-clamp-2 text-sm font-bold text-gray-800 transition hover:text-[--color-primary]">
                  {post.title}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
