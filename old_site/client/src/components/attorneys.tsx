export default function Attorneys() {
  const attorneys = [
    {
      name: "John Anderson",
      title: "Senior Partner",
      image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500",
      alt: "Senior attorney in professional attire",
      testId: "attorney-john-anderson"
    },
    {
      name: "Sarah Mitchell",
      title: "Family Law Attorney",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500",
      alt: "Female attorney in professional business suit",
      testId: "attorney-sarah-mitchell"
    },
    {
      name: "Michael Roberts",
      title: "Criminal Defense",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500",
      alt: "Attorney with glasses in formal business suit",
      testId: "attorney-michael-roberts"
    },
    {
      name: "Emily Davis",
      title: "Corporate Law",
      image: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500",
      alt: "Young female attorney smiling in professional attire",
      testId: "attorney-emily-davis"
    }
  ];

  return (
    <section className="py-24 bg-white" id="attorneys">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-brand-gold font-semibold" data-testid="text-attorneys-subtitle">Our Team</p>
          <div className="w-16 h-0.5 bg-brand-gold my-4 mx-auto"></div>
          <h2 className="font-serif text-4xl text-brand-blue font-bold" data-testid="text-attorneys-title">
            Meet Our Expert Attorneys
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {attorneys.map((attorney, index) => (
            <div key={index} className="group" data-testid={attorney.testId}>
              <div className="relative overflow-hidden mb-4">
                <img 
                  src={attorney.image}
                  alt={attorney.alt}
                  className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                  data-testid={`img-${attorney.testId}`}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-brand-blue bg-opacity-90 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <div className="flex justify-center space-x-4">
                    <a href="#" className="text-white hover:text-brand-gold transition-colors" data-testid={`link-${attorney.testId}-facebook`}>
                      <span className="iconify" data-icon="mdi:facebook" data-width="20"></span>
                    </a>
                    <a href="#" className="text-white hover:text-brand-gold transition-colors" data-testid={`link-${attorney.testId}-twitter`}>
                      <span className="iconify" data-icon="mdi:twitter" data-width="20"></span>
                    </a>
                    <a href="#" className="text-white hover:text-brand-gold transition-colors" data-testid={`link-${attorney.testId}-linkedin`}>
                      <span className="iconify" data-icon="mdi:linkedin" data-width="20"></span>
                    </a>
                  </div>
                </div>
              </div>
              <h3 className="font-serif text-xl text-brand-blue font-bold" data-testid={`text-${attorney.testId}-name`}>
                {attorney.name}
              </h3>
              <p className="text-brand-gold text-sm" data-testid={`text-${attorney.testId}-title`}>
                {attorney.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
