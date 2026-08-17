import { Link } from 'react-router-dom';

export default function Home() {
  const metrics = [
    { value: '3.2x', label: 'HIGHER CONVERSION THAN Standard SPAS' },
    { value: '< 1s', label: 'LIGHTNING FAST VITE PAGE LOADS' },
    { value: '100%', label: 'DIRECT WHATSAPP CLIENT OWNERSHIP' },
  ];

  const features = [
    {
      title: 'WhatsApp Concierge Checkout',
      desc: 'Bypass friction-heavy payment gateways. Every buyer action routes directly to your structured WhatsApp order thread with populated product details and totals.',
      tag: 'DIRECT COMMERCE',
    },
    {
      title: 'Server-Injected Social Meta',
      desc: 'Sharing a product link on WhatsApp or Twitter dynamically renders high-res product photos and dynamic price tags in native link preview cards.',
      tag: 'LINK INFRASTRUCTURE',
    },
    {
      title: 'Executive Sales Intelligence',
      desc: 'Track high-intent traffic, top-performing catalog pieces, and total WhatsApp conversion values directly inside your private merchant suite.',
      tag: 'ANALYTICS',
    },
  ];

  const plans = [
    {
      name: 'ATELIER ESSENTIALS',
      price: '₦ 25,000',
      period: '/ month',
      desc: 'For emerging fashion houses and luxury boutiques starting direct social sales.',
      features: [
        'Up to 50 Active Catalog Items',
        'Direct WhatsApp Checkout Routing',
        'Dynamic OpenGraph Social Previews',
        'Standard Sales Intelligence Suite',
      ],
      highlighted: false,
      cta: 'Start Free Trial',
    },
    {
      name: 'MAISON PRO',
      price: '₦ 65,000',
      period: '/ month',
      desc: 'For established haute couture brands requiring full multi-item cart workflows and priority edge deployment.',
      features: [
        'Unlimited Active Pieces',
        'Multi-Item Shopping Bag State',
        'Cloudinary Auto-Image Transformation',
        'Priority WhatsApp Route Forwarding',
        'Custom Domain Binding Support',
      ],
      highlighted: true,
      cta: 'Establish Maison',
    },
  ];

  return (
    <div className="space-y-28 pb-20">
      {/* SaaS Hero Section */}
      <section className="text-center space-y-8 max-w-4xl mx-auto pt-12">
        <h1 className="font-serif text-4xl sm:text-6xl text-white font-normal tracking-wide uppercase leading-tight">
          Turn Your Business Catalog into Direct WhatsApp Sales
        </h1>

        <p className="max-w-2xl mx-auto text-luxury-muted text-xs sm:text-sm tracking-editorial uppercase leading-relaxed">
          An ultra-fast storefront platform built for merchants in Nigeria. Showcase your business and route orders straight to your WhatsApp concierge.
        </p>

        <div className="pt-2 flex justify-center items-center space-x-6">
          <Link
            to="/register"
            className="bg-luxury-gold text-luxury-black font-semibold text-xs uppercase tracking-editorial px-8 py-4 hover:bg-luxury-gold-hover transition-colors"
          >
            Launch Your Storefront
          </Link>
          <Link
            to="/login"
            className="border border-luxury-border text-white text-xs uppercase tracking-editorial px-8 py-4 hover:border-luxury-gold transition-colors"
          >
            Merchant Sign In
          </Link>
        </div>
      </section>

      {/* Metrics Banner */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-luxury-charcoal border border-luxury-border/60 p-10">
        {metrics.map((m, idx) => (
          <div key={idx} className="text-center space-y-2 border-b md:border-b-0 md:border-r border-luxury-border/60 last:border-none pb-6 md:pb-0">
            <div className="font-serif text-4xl text-luxury-gold">{m.value}</div>
            <div className="text-[10px] tracking-widest text-luxury-muted uppercase">{m.label}</div>
          </div>
        ))}
      </section>

      {/* Product Workflow / Feature Showcase */}
      <section className="space-y-12">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-[10px] tracking-widest text-luxury-gold uppercase block">ENGINEERED FOR ELEGANCE</span>
          <h2 className="font-serif text-3xl text-white tracking-wide uppercase">Core Platform Features</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
          {features.map((f, idx) => (
            <div
              key={idx}
              className="bg-luxury-charcoal border border-luxury-border/60 p-8 space-y-4 relative hover:border-luxury-gold/50 transition-colors"
            >
              <span className="text-[9px] font-mono tracking-widest text-luxury-gold uppercase bg-luxury-black border border-luxury-border/80 px-2.5 py-1 inline-block">
                {f.tag}
              </span>
              <h3 className="font-serif text-xl text-white tracking-wider">{f.title}</h3>
              <p className="text-luxury-muted text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Table */}
      <section className="space-y-12">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-[10px] tracking-widest text-luxury-gold uppercase block">SIMPLE INVESTMENT</span>
          <h2 className="font-serif text-3xl text-white tracking-wide uppercase">Transparent Subscriptions</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((p, idx) => (
            <div
              key={idx}
              className={`bg-luxury-charcoal p-10 flex flex-col justify-between border relative ${
                p.highlighted ? 'border-luxury-gold' : 'border-luxury-border/60'
              }`}
            >
              {p.highlighted && (
                <span className="absolute -top-3 right-8 bg-luxury-gold text-luxury-black text-[9px] font-bold uppercase tracking-widest px-3 py-1">
                  RECOMMENDED
                </span>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="font-serif text-xl text-white tracking-widest">{p.name}</h3>
                  <p className="text-luxury-muted text-xs mt-2 leading-relaxed">{p.desc}</p>
                </div>

                <div className="flex items-baseline space-x-2 font-mono">
                  <span className="text-3xl text-luxury-gold font-bold">{p.price}</span>
                  <span className="text-xs text-luxury-muted uppercase">{p.period}</span>
                </div>

                <ul className="space-y-3 border-t border-luxury-border/60 pt-6">
                  {p.features.map((feat, fIdx) => (
                    <li key={fIdx} className="text-xs text-white flex items-center space-x-3">
                      <span className="text-luxury-gold font-mono">✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                to="/register"
                className={`mt-10 w-full text-center text-xs font-semibold uppercase tracking-editorial py-4 transition-colors ${
                  p.highlighted
                    ? 'bg-luxury-gold text-luxury-black hover:bg-luxury-gold-hover'
                    : 'border border-luxury-border text-white hover:border-luxury-gold'
                }`}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="bg-luxury-charcoal border border-luxury-gold/40 p-12 text-center space-y-6">
        <span className="text-[10px] tracking-[0.3em] text-luxury-gold uppercase block">READY TO SCALE?</span>
        <h2 className="font-serif text-3xl text-white tracking-wide uppercase max-w-xl mx-auto">
          Launch Your Custom WhatsApp Storefront in Minutes
        </h2>
        <p className="text-luxury-muted text-xs tracking-editorial uppercase max-w-lg mx-auto leading-relaxed">
          Join high-end Nigerian ateliers using custom commerce routes to increase client conversions.
        </p>
        <Link
          to="/register"
          className="inline-block bg-luxury-gold text-luxury-black font-semibold text-xs uppercase tracking-editorial px-10 py-4 hover:bg-luxury-gold-hover transition-colors"
        >
          Create Atelier Account
        </Link>
      </section>
    </div>
  );
}
