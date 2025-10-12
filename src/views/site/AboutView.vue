<template>
  <div class="about-page">
    <!-- Hero Section -->
    <section class="about-hero">
      <div class="hero-content">
        <h1 class="hero-title">About <span class="text-gradient">ElbialyPS</span></h1>
        <p class="hero-subtitle">
          Building the future of dashboard platforms with modern design and cutting-edge technology
        </p>
      </div>
    </section>

    <!-- Story Section -->
    <section class="story-section">
      <div class="story-content">
        <div class="story-text">
          <h2 class="section-title">Our Story</h2>
          <p class="story-paragraph">
            ElbialyPS was born from a vision to create the perfect dashboard experience. 
            We believe that technology should be beautiful, intuitive, and accessible to everyone.
          </p>
          <p class="story-paragraph">
            Our platform combines modern web technologies with thoughtful design to deliver 
            an experience that adapts to your needs, whether you're on mobile or desktop.
          </p>
        </div>
        <div class="story-visual">
          <div class="visual-grid">
            <div class="visual-card card-1">
              <div class="card-icon">🎬</div>
              <h3>Dashboard</h3>
            </div>
            <div class="visual-card card-2">
              <div class="card-icon">📱</div>
              <h3>Responsive</h3>
            </div>
            <div class="visual-card card-3">
              <div class="card-icon">🎨</div>
              <h3>Modern Design</h3>
            </div>
            <div class="visual-card card-4">
              <div class="card-icon">⚡</div>
              <h3>Fast & Smooth</h3>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <h2 class="section-title centered">What Makes Us Different</h2>
      <div class="features-grid">
        <div class="feature-item">
          <div class="feature-icon">🌙</div>
          <h3 class="feature-title">Dark Theme First</h3>
          <p class="feature-description">
            Designed with a beautiful dark theme that's easy on the eyes and perfect for any time of day.
          </p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">📐</div>
          <h3 class="feature-title">Responsive Design</h3>
          <p class="feature-description">
            Automatically adapts between mobile and desktop layouts for the perfect experience on any device.
          </p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">✨</div>
          <h3 class="feature-title">Smooth Animations</h3>
          <p class="feature-description">
            Every interaction is enhanced with carefully crafted animations and transitions.
          </p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">🔒</div>
          <h3 class="feature-title">Secure & Private</h3>
          <p class="feature-description">
            Your data and privacy are our top priority with enterprise-grade security measures.
          </p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">⚡</div>
          <h3 class="feature-title">Lightning Fast</h3>
          <p class="feature-description">
            Built with modern technologies for optimal performance and instant loading.
          </p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">🎯</div>
          <h3 class="feature-title">User Focused</h3>
          <p class="feature-description">
            Every feature is designed with the user experience in mind, making everything intuitive.
          </p>
        </div>
      </div>
    </section>

    <!-- Technology Section -->
    <section class="tech-section">
      <div class="tech-content">
        <h2 class="section-title centered">Built With Modern Technology</h2>
        <div class="tech-grid">
          <div class="tech-item">
            <div class="tech-logo">⚡</div>
            <h4>Vue 3</h4>
            <p>Progressive JavaScript framework</p>
          </div>
          <div class="tech-item">
            <div class="tech-logo">🎨</div>
            <h4>CSS Grid & Flexbox</h4>
            <p>Modern layout techniques</p>
          </div>
          <div class="tech-item">
            <div class="tech-logo">📱</div>
            <h4>Responsive Design</h4>
            <p>Mobile-first approach</p>
          </div>
          <div class="tech-item">
            <div class="tech-logo">🔧</div>
            <h4>Vite</h4>
            <p>Fast build tool and dev server</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section class="contact-section">
      <div class="contact-content">
        <h2 class="section-title centered">Get In Touch</h2>
        <p class="contact-description">
          Have questions or feedback? We'd love to hear from you.
        </p>
        <div class="contact-actions">
          <router-link to="/" class="btn btn-primary">
            Back to Home
          </router-link>
          <router-link to="/dashboard" class="btn btn-secondary">
            Try Dashboard
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about-page {
  min-height: 100vh;
}

.about-hero {
  padding: 6rem 2rem 4rem;
  text-align: center;
  background: radial-gradient(ellipse at center, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  line-height: 1.1;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.story-section {
  padding: 6rem 2rem;
}

.story-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 2rem;
}

.section-title.centered {
  text-align: center;
  margin-bottom: 3rem;
}

.story-paragraph {
  font-size: 1.125rem;
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 1.5rem;
}

.visual-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.visual-card {
  padding: 2rem 1.5rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  text-align: center;
  transition: all var(--transition-normal);
}

.visual-card:hover {
  transform: translateY(-4px);
  border-color: var(--border-accent);
  box-shadow: var(--shadow-md);
}

.card-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.visual-card h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.card-1:hover { border-color: rgba(139, 92, 246, 0.5); }
.card-2:hover { border-color: rgba(6, 182, 212, 0.5); }
.card-3:hover { border-color: rgba(59, 130, 246, 0.5); }
.card-4:hover { border-color: rgba(16, 185, 129, 0.5); }

.features-section {
  padding: 6rem 2rem;
  background: rgba(255, 255, 255, 0.02);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-item {
  padding: 2.5rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  text-align: center;
  transition: all var(--transition-normal);
}

.feature-item:hover {
  transform: translateY(-8px);
  border-color: var(--border-accent);
  box-shadow: var(--shadow-lg);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.feature-description {
  color: var(--text-secondary);
  line-height: 1.6;
}

.tech-section {
  padding: 6rem 2rem;
}

.tech-content {
  max-width: 1000px;
  margin: 0 auto;
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.tech-item {
  padding: 2rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  text-align: center;
  transition: all var(--transition-normal);
}

.tech-item:hover {
  transform: translateY(-4px);
  border-color: var(--border-accent);
  box-shadow: var(--shadow-md);
}

.tech-logo {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.tech-item h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.tech-item p {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.contact-section {
  padding: 6rem 2rem;
  background: rgba(139, 92, 246, 0.05);
  text-align: center;
}

.contact-content {
  max-width: 600px;
  margin: 0 auto;
}

.contact-description {
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.contact-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 2rem;
  border-radius: var(--radius-lg);
  font-weight: 600;
  text-decoration: none;
  transition: all var(--transition-normal);
  border: 1px solid;
  cursor: pointer;
}

.btn-primary {
  background: var(--gradient-primary);
  border-color: transparent;
  color: white;
  box-shadow: var(--shadow-md);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-secondary {
  background: transparent;
  border-color: var(--border-primary);
  color: var(--text-secondary);
}

.btn-secondary:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.125rem;
  }
  
  .story-content {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
  
  .visual-grid {
    grid-template-columns: 1fr;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .tech-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .contact-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 100%;
    max-width: 280px;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .tech-grid {
    grid-template-columns: 1fr;
  }
  
  .about-hero {
    padding: 4rem 1rem 3rem;
  }
  
  .story-section,
  .features-section,
  .tech-section,
  .contact-section {
    padding: 4rem 1rem;
  }
}
</style>
