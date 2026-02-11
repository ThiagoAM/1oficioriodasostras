export default function Blog() {
  const blogPosts = [
    {
      title: "Understanding Child Custody Laws in Australia",
      category: "Family Law",
      date: "January 15, 2024",
      image: "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
      alt: "Legal books and gavel on desk",
      excerpt: "Navigate the complexities of child custody arrangements with our comprehensive guide to Australian family law.",
      testId: "blog-child-custody"
    },
    {
      title: "Key Considerations for Business Contracts",
      category: "Business Law",
      date: "January 10, 2024",
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
      alt: "Business meeting with contracts and documents",
      excerpt: "Protect your business interests with properly structured contracts. Learn what clauses you shouldn't overlook.",
      testId: "blog-business-contracts"
    },
    {
      title: "Your Rights After a Car Accident",
      category: "Personal Injury",
      date: "January 5, 2024",
      image: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
      alt: "Scales of justice with legal documents",
      excerpt: "Know your legal rights and the steps to take following a motor vehicle accident to ensure fair compensation.",
      testId: "blog-car-accident"
    }
  ];

  return (
    <section className="py-24 bg-white" id="news">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-brand-gold font-semibold" data-testid="text-blog-subtitle">Latest News</p>
          <div className="w-16 h-0.5 bg-brand-gold my-4 mx-auto"></div>
          <h2 className="font-serif text-4xl text-brand-blue font-bold" data-testid="text-blog-title">
            Legal Insights & Updates
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <article 
              key={index} 
              className="bg-white border border-gray-200 overflow-hidden group hover:shadow-xl transition-shadow"
              data-testid={post.testId}
            >
              <div className="overflow-hidden">
                <img 
                  src={post.image}
                  alt={post.alt}
                  className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                  data-testid={`img-${post.testId}`}
                />
              </div>
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-3" data-testid={`meta-${post.testId}`}>
                  <span className="iconify mr-1" data-icon="mdi:calendar" data-width="16"></span>
                  <span>{post.date}</span>
                  <span className="mx-2">•</span>
                  <span>{post.category}</span>
                </div>
                <h3 className="font-serif text-xl text-brand-blue font-bold mb-3 group-hover:text-brand-gold transition-colors" data-testid={`text-${post.testId}-title`}>
                  {post.title}
                </h3>
                <p className="text-gray-600 mb-4" data-testid={`text-${post.testId}-excerpt`}>
                  {post.excerpt}
                </p>
                <a 
                  href="#" 
                  className="text-brand-gold font-semibold hover:underline inline-flex items-center"
                  data-testid={`link-${post.testId}-read-more`}
                >
                  Read More
                  <span className="iconify ml-1" data-icon="mdi:arrow-right" data-width="20"></span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
