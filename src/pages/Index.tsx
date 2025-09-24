// Update this page (the content is just a fallback if you fail to update the page)

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Welcome to TechShop</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Discover amazing products with great prices and excellent reviews!
          </p>
          <Link to="/">
            <Button size="lg" className="btn-shop">
              Start Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
